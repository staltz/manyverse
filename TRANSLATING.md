# Translations

Thank you for your interest in contributing translations to Manyverse! Follow this guide to setup and get started with.

We use the online platform [Crowdin](https://crowdin.com) to easily craft the translation strings. It makes the process much easier, and doesn't require you to know anything about programming.

## Manyverse Crowdin project

- Make an account at Crowdin by following this link: https://manyverse.crowdin.com/u/signup
- Open our translation project: https://manyverse.crowdin.com/u/projects/4
- On the main page for the project, **click on a language** that you are fluent in
- Once the language page opens, click on **ALL STRINGS** then **Crowdsourcing**
- You now see the crowdsourcing dashboard where you can already start translating **strings that are marked with a red dot**

## Tips

### Variables

Some texts may have user data injected into them with the format `{{data}}`, for instance:

```
There are {{amount}} friends online
```

Note that you **must preserve** the `{{amount}}` in your text. For instance, if we were translating the above into Brazilian Portuguese, the correct text should be:

```
Há {{amount}} amigos online
```

### Context

The purpose of the string is signalled by the "context" field which is usually a chain such as `connections -> peers -> types -> room -> others_online`. The first part in this chain is usually an individual screen in the app. So the string `({{amount}} online)` might be ambiguous when read in isolation, but we know from the context that it is in the `connections` screen, describing on the peer types, in specific a `room` and indicating the amount of `others_online`.

### Duplicate strings

Sometimes the same string in English may be repeated in multiple places. This is not a problem, and it's okay to repeat it in your target language too. But note that not all languages would have repeated strings, the context may alter the specific translation. For instance, English may repeat the string "Comment" which is simultaneously a noun and a verb, but in Portuguese, the noun is "Comentário" and the verb is "Comentar", so if the context dictates a verb or a noun, the translation will be different.

### Sentences with bold formatting

Some texts in the app are split into parts, because we need to make some parts **bold**. You can notice that this is the case when the "context" looks something like:

- welcome -> off_the_grid -> description -> **1_normal**
- welcome -> off_the_grid -> description -> **2_bold**
- welcome -> off_the_grid -> description -> **3_normal**
- welcome -> off_the_grid -> description -> **4_bold**
- welcome -> off_the_grid -> description -> **5_normal**

Pay careful attention that these 5 texts will be joined together as one sentence, so there **may need to be a whitespace at the end** or beginning of some of these. Also, depending on your language, you may not need all of these parts. For instance, if you want to **start the sentence with bold**, you can just make the "1_normal" string empty, and put the bold starter text in "2_bold". For example, assume the original string in English:

- 1_normal: "The "
- 2_bold: "book"
- 3_normal: " is on the table"

Some languages might not start with a preposition such as "The". In that case it's perfectly fine to leave `1_normal` empty and start the string with bold. For example, the above translated to Finnish would be:

- 1_normal: ""
- 2_bold: "Kirja"
- 3_normal: " on pöydällä"

If the split doesn't work in your language or if you don't want to use bold, then it's also fine to put the entire sentence in one of the parts, for example:

- 1_normal: "The book is on the table"
- 2_bold: ""
- 3_normal: ""

## When you're done

You just need to press "Save" for each text that you translate, after that there is nothing else that you need to do! The Crowdin system will automatically send us a [merge request in GitLab](https://gitlab.com/staltz/manyverse/-/merge_requests) and we (developers) will review that before including it into Manyverse. The actual release of the translated texts has to be done manually like any new version release. Thank you for translating!