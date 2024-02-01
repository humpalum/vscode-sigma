import json
import csv

finobj = []

# Get this at https://github.com/mitre/cti/blob/master/enterprise-attack/enterprise-attack.json
with open("enterprise-attack.json") as f:
    data = json.load(f)
    for i in data["objects"]:
        # if i["type"] == "attack-pattern":
        if "external_references" in i:
            for id in i["external_references"]:
                if "external_id" in id and "description" in i:
                    finobj.append(
                        {"name": i["name"], "description": i["description"], "tag": id["external_id"], "url": id["url"]})


# Get this at https://d3fend.mitre.org/ontologies/d3fend.csv
with open("d3fend.csv") as file:
    spamreader = csv.reader(file, delimiter=',')
    for row in spamreader:
        id = row[0]
        name= row[2] if row[2] != '' else row[3] if row[3] != '' else row[4]
        desc = row[5]
        finobj.append({"name": name, "description": desc, "tag":id, "url":"https://d3fend.mitre.org/"})


finobj.sort(key=lambda x: x["tag"])
with open("./src/techniques.json", 'w') as nf:
    nf.write(json.dumps(finobj, indent=4))
