import json
import csv
import os
import sys
import urllib.request

STIX_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json"
D3FEND_URL = "https://d3fend.mitre.org/ontologies/d3fend.csv"

def download_file(url, target_path):
    print(f"Downloading {url} -> {target_path}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp, open(target_path, "wb") as f:
        f.write(resp.read())
    print(f"Downloaded {target_path}")

def main():
    force_download = "--download" in sys.argv
    stix_file = "enterprise-attack.json"
    d3fend_file = "d3fend.csv"

    if force_download or not os.path.exists(stix_file):
        download_file(STIX_URL, stix_file)

    if force_download or not os.path.exists(d3fend_file):
        download_file(D3FEND_URL, d3fend_file)

    print("Loading STIX dataset...")
    with open(stix_file, mode="r", encoding="utf-8") as f:
        stix_data = json.load(f)

    finobj = []
    seen_tags = set()

    def add_entry(tag, name, desc, url):
        if not tag or tag in seen_tags:
            return
        seen_tags.add(tag)
        finobj.append({
            "name": (name or "").strip(),
            "description": (desc or "").strip(),
            "tag": tag.strip(),
            "url": (url or "").strip()
        })

    objects = stix_data.get("objects", [])

    # 1. Tactics (x-mitre-tactic)
    for obj in objects:
        if obj.get("type") == "x-mitre-tactic" and not obj.get("revoked", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url = refs[0].get("url") or f"https://attack.mitre.org/tactics/{tag}"
                add_entry(tag, name, desc, url)

    # Backward-compatibility alias: Defense Evasion for TA0005
    add_entry(
        "TA0005-legacy",
        "Defense Evasion",
        "Legacy tactic name superseded in ATT&CK v19 by Stealth (TA0005) and Defense Impairment (TA0112).",
        "https://attack.mitre.org/tactics/TA0005"
    )

    # 2. Techniques & Sub-techniques (attack-pattern)
    for obj in objects:
        if obj.get("type") == "attack-pattern" and not obj.get("revoked", False) and not obj.get("x_mitre_deprecated", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url_path = tag.replace(".", "/")
                url = refs[0].get("url") or f"https://attack.mitre.org/techniques/{url_path}"
                add_entry(tag, name, desc, url)

    # 3. Software (malware & tool)
    for obj in objects:
        if obj.get("type") in ("malware", "tool") and not obj.get("revoked", False) and not obj.get("x_mitre_deprecated", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url = refs[0].get("url") or f"https://attack.mitre.org/software/{tag}"
                add_entry(tag, name, desc, url)

    # 4. Groups (intrusion-set)
    for obj in objects:
        if obj.get("type") == "intrusion-set" and not obj.get("revoked", False) and not obj.get("x_mitre_deprecated", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url = refs[0].get("url") or f"https://attack.mitre.org/groups/{tag}"
                add_entry(tag, name, desc, url)

    # 5. Campaigns (campaign)
    for obj in objects:
        if obj.get("type") == "campaign" and not obj.get("revoked", False) and not obj.get("x_mitre_deprecated", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url = refs[0].get("url") or f"https://attack.mitre.org/campaigns/{tag}"
                add_entry(tag, name, desc, url)

    # 6. Data Sources (x-mitre-data-source)
    for obj in objects:
        if obj.get("type") == "x-mitre-data-source" and not obj.get("revoked", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url = refs[0].get("url") or f"https://attack.mitre.org/datasources/{tag}"
                add_entry(tag, name, desc, url)

    # 7. Mitigations (course-of-action)
    for obj in objects:
        if obj.get("type") == "course-of-action" and not obj.get("revoked", False) and not obj.get("x_mitre_deprecated", False):
            refs = [r for r in obj.get("external_references", []) if r.get("source_name") in ("mitre-attack", "mitre-enterprise-attack")]
            if refs:
                tag = refs[0].get("external_id")
                name = obj.get("name")
                desc = obj.get("description", "")
                url = refs[0].get("url") or f"https://attack.mitre.org/mitigations/{tag}"
                add_entry(tag, name, desc, url)

    # 8. D3FEND
    if os.path.exists(d3fend_file):
        with open(d3fend_file, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter=",")
            for row in reader:
                if not row or len(row) < 6:
                    continue
                tag = row[0].strip()
                # Skip header row and non-D3FEND tags
                if tag == "ID" or not tag.startswith("D3-"):
                    continue
                name = row[2] if row[2] != "" else row[3] if row[3] != "" else row[4]
                desc = row[5]
                add_entry(tag, name, desc, "https://d3fend.mitre.org/")

    # Sort deterministically by tag
    finobj.sort(key=lambda x: x["tag"])

    out_file = "./src/techniques.json"
    print(f"Writing {len(finobj)} entries to {out_file}...")
    with open(out_file, mode="w", encoding="utf-8") as nf:
        json.dump(finobj, nf, indent=4)

    print("Successfully built techniques.json!")

if __name__ == "__main__":
    main()
