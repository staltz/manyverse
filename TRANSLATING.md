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

### Sentences with bold formatting

Some texts in the app are split into parts, because we need to make some parts **bold**. You can notice that this is the case when the "context" looks something like:

- welcome -> off_the_grid -> description -> **1_normal**
- welcome -> off_the_grid -> description -> **2_bold**
- welcome -> off_the_grid -> description -> **3_normal**
- welcome -> off_the_grid -> description -> **4_bold**
- welcome -> off_the_grid -> description -> **5_normal**

Pay careful attention that these 5 texts will be joined together as one sentence, so there **may need to be a whitespace at the end** or beginning of some of these. Also, depending on your language, you may not need all of these parts. For instance, if you want to **start the sentence with bold**, you can just make the "1_normal" string empty, and put the bold starter text in "2_bold".

## When you're done

You just need to press "Save" for each text that you translate, after that there is nothing else that you need to do! The Crowdin system will automatically send us a [merge request in GitLab](https://gitlab.com/staltz/manyverse/-/merge_requests) and we (developers) will review that before including it into Manyverse. The actual release of the translated texts has to be done manually like any new version release. Thank you for translating!