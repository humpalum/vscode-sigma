import json

# Get this at https://github.com/mitre/cti/blob/master/enterprise-attack/enterprise-attack.json
with open("enterprise-attack.json") as f:
    data = json.load(f)
    finobj = []
    for i in data["objects"]:
        # if i["type"] == "attack-pattern":
        if "external_references" in i:
            for id in i["external_references"]:
                if "external_id" in id and "description" in i:
                    finobj.append(
                        {"name": i["name"], "description": i["description"], "tag": id["external_id"], "url": id["url"]})

    # Sort json
    finobj.sort(key=lambda x: x["tag"])

    with open("./src/techniques.json", 'w') as nf:
        nf.write(json.dumps(finobj, indent=4))
