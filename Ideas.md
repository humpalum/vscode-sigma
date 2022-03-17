# Ideas

## Snippets (LowHanging)
- [x] Unique ID 
- [x] modified, automatic date
- [x] date, automatic date
- [x] References: List
- [x] author: Name from Config
- [ ] logsource: 
    - ex. lssysmon -> logsource: product: windows\n service: sysmon 
    product: Windows/Linux/Webserver/Proxy/(EDR, Amazon,...)
    category: ...
    service: ...
- [x] level: Critical/High/medium/low
- [x] status: experimental, test, stable, deprecated, unsupported
- [ ] relation: (LowPrio)
- [ ] "|" opens modifier


## New Rule Generation
- New File Generation -- Thats the Hard part. Templates for every kind of rule? Sort Rule by Logsource? Get current combination of Logsources? (LowPrio)
- [x] get author. Set author in config
- [x] Automatic UUID
- [x] Set Logsource? From file Directory?
- [x] status: experimental
- [x] date
- [x] FalsePositives

## Mitre Tags
- tags: Own module
- Load Tags with a search?
- Mouse Over a Tag -> Description...

## condition values 
- escaped stuff "" '' \ doesn't need escapes. Check exceptions
    - Warn when \\ AND \ is in there - Check char after \ "Rule Creation Guide \\\ [Backshlashes](https://github.com/SigmaHQ/sigma/wiki/Rule-Creation-Guide#backslashes)"
    - 
- autocompletion 
    - 1 of [identifier in the condition] 
    - and [1 of | identifier]


## On the fly (LowPrio)
- Check sigma test script for further tests to do on the fly
    - mark: 1/one of them 
        - 1/one of Selection* ist ok
    - Description Length
    - Title Length
    - Date Format
    - Reference     
    - unique ID (LowPrio)
        - unique ID Checker 
        - check if ID is used somewhere else
    
    - Check if all identifier are used
    - contains should be at the end of modifier (Exception contains|all)
        - Mark yellow: contains|base64 as most likely unwanted
    - mark blue: String with \*abc\* instead of contains #MARKDOWN ESCAPES
- Experimental Rule older than 1 Year???

## Check Syntax as per Rx YAML
- https://github.com/SigmaHQ/sigma/wiki/Specification#rx-yaml
- make this live


## Commands
- Sort Keys 
- 3 Spaces as tabs for sigma files

- If in condition, give fieldnames as completion