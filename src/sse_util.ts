import axios, { AxiosResponse } from "axios"
import { SigmaSearchResultEntry  } from "./types"
import { sigmasearchengineURL } from "./configuration"


export function cleanField(field: string): string {
    let newField = field.replace("|endswith", "")
    newField = newField.replace("|all", "")
    newField = newField.replace("|contains", "")
    newField = newField.replace("|startswith", "")
    newField = newField.replace("|re", "")
    newField = newField.replace("|base64offset", "")
    newField = newField.replace("|cidr", "")
    return newField.trim()
}

//"+-=&|><!(){}[]^\"~*?:\\/ "
export function escapeString(s: string): string {
    let newS = s.replaceAll("+", "\\+")
    newS = newS.replaceAll("-", "\\-")
    newS = newS.replaceAll("=", "\\=")
    newS = newS.replaceAll("&", "\\&")
    newS = newS.replaceAll("|", "\\|")
    newS = newS.replaceAll("<", "\\<")
    newS = newS.replaceAll("<", "\\<")
    newS = newS.replaceAll("!", "\\!")
    newS = newS.replaceAll("(", "\\(")
    newS = newS.replaceAll(")", "\\)")
    newS = newS.replaceAll("{", "\\{")
    newS = newS.replaceAll("}", "\\}")
    newS = newS.replaceAll("[", "\\[")
    newS = newS.replaceAll("]", "\\]")
    newS = newS.replaceAll("^", "\\^")
    newS = newS.replaceAll("\\", "\\\\")
    newS = newS.replaceAll(`"`, "\\\"")
    newS = newS.replaceAll("~", "\\~")
    newS = newS.replaceAll("*", "\\*")
    newS = newS.replaceAll("?", "\\?")
    newS = newS.replaceAll(":", "\\:")
    newS = newS.replaceAll("/", "\\/")
    newS = newS.replaceAll(" ", "\\ ")
    return newS
}

export async function execQuery(query: string): Promise<SigmaSearchResultEntry[]> {
    var result: SigmaSearchResultEntry[] = []

    var buff = Buffer.from(query);
    var b64 = buff.toString('base64');
    await axios.get(sigmasearchengineURL + "/sigma/query/" + b64).then((res: AxiosResponse) => {
        res.data.map((entry: SigmaSearchResultEntry) => {
            result.push(entry)
        })
    }).catch((err: any) => {
        console.log(err)
    })

    // TESTING

    // var ssre1: SigmaSearchResultEntry = { 
    //     title: "1",
    //     score: 120,
    //     id: "",
    //     description: "",
    //     author: "",
    //     url: ""
    // }
    // result.push(ssre1)

    // var ssre1: SigmaSearchResultEntry = { 
    //     title: "1",
    //     score: 110,
    //     id: "",
    //     description: "",
    //     author: "",
    //     url: ""
    // }
    // result.push(ssre1)

    // var ssre1: SigmaSearchResultEntry = { 
    //     title: "2",
    //     score: 100,
    //     id: "",
    //     description: "",
    //     author: "",
    //     url: ""
    // }
    // result.push(ssre1)

    return result

}