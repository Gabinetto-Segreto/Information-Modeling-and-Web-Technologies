import json

# read json file
with open("data\phallic_culture_texts.json", mode="r", encoding="utf-8") as file:
    json_object = json.load(file)
    #print(json_object)
    #print(json_object[0])
    #print(len(json_object)) #18

# initialize new dict structure
updated_structure = {
    "items": []
}
#keys = updated_structure.keys()
#print(keys)

# initialize nested dictionary
item = {
    "name": "",
    "info": {

    },
    "narratives": {
        "time": "",
        "place": "",
        "artistic expression": ""
    }
}

# function definition
def update_structure(json_object):
    for i in json_object:
        item = {
            "name": i["name"],
            "iId": i["iId"],
            "info": {
                "text 1": i["text 1"],
                "text 2": i["text 2"],
                "text 3": i["text 3"],
                "image": i["image"],
                "narratives": {
                    "time": i["dateCreated"],
                    "place": i["locationCreated"],
                    "artistic expression": i["genre"]
                    }
            },
            "itemMeta": {
                "dateCreated": i["dateCreated"],
                "containedInPlace": i["containedInPlace"],
                "author": i["author"],
                "sameAs": i["sameAs"],
                "locationCreated": i["locationCreated"],
                "genre": i["genre"],
                "religion": i["religion"],
            },  
        }
        updated_structure["items"].append(item)
    #print(updated_structure["items"])
    return updated_structure

# function call
new_file = update_structure(json_object)
#print("This is the new file:")
#print(new_file)
#print(len(updated_structure["items"]))


# output json
json_string = json.dumps(new_file)

with open("data\\json_with_schema.json", mode="w", encoding="utf-8") as output:
    json.dump(new_file, output, ensure_ascii=False, indent=4)