As a logged-in user or guest

I want to open QDC with the default settings according to my device language and my country

So that the user can understand the website content

**Acceptance criteria:**

- The system should know the user’s country based on the IP and the user’s device language
- Available languages on QDC are (English, العربية, বাংলা, فارسی, Français, Indonesia, Italiano,
  Dutch, Português, русский, Shqip, ภาษาไทย, Türkçe, اردو, 简体中文, Melayu)
- When the user opens QDC for the first time as a guest, the system should check the user’s device
  language
  - If the user’s device language is “English“
    - Show the user’s settings (Mushaf style, Translation, Tafsir, word-by-word language, Reciter,
      and Reflections language) according to the user’s device language is “English” and the
      detected user’s country in the attached sheet
  - If the user’s device language isn’t “English“ but one of the available languages in QDC
    - Show the user’s settings (Mushaf style, Translation, Tafsir, word-by-word language, Reciter,
      and Reflections language) according to the detected user’s device language in the attached
      sheet and regardless of the user's country
  - If the user’s device language isn’t “English“ and isn’t one of the available languages in QDC
    - Show the user’s settings (Mushaf style, Translation, Tafsir, word-by-word language, Reciter,
      and Reflections language) from the attached sheet according to the detected user’s country and
      assume the detected language is “English“
- The default guest’s settings should be saved in the redux
- When the guest user signs up, the user settings should be saved in the database
- When the guest login, the system should load the view with the user’s settings according to his
  changes if they exist
- If the logged-in user or guest user decides to “Reset settings“ that means applying the above
  behavior like the first time on QDC
- If the logged-in user or guest chooses to change the QDC language (website localization) from the
  world icon, the system should check first, Did the user change at least one of these preferences
  (Mushaf style, Translation, Tafsir, word-by-word language, Reciter, and Reflections language)
  before changing the language?
  - If yes, the system should change the QDC localization to the selected language and should
    **NOT** change any settings (Mushaf style, Translation, Tafsir, word-by-word language, Reciter,
    and Reflections language) and keep it as it is in the db or redux
  - If No, The system should check which language is selected by the user
    - If the selected language is “English“, the system should change the user’s settings (Mushaf
      style, Translation, Tafsir, word-by-word language, Reciter, and Reflections language)
      \*\*\*\*to the matched settings in the sheet which is English and the detected User's country
    - If the selected language isn’t “English“ but one of the available languages in QDC, the system
      should change the user’s settings (Mushaf style, Translation, Tafsir, word-by-word language,
      Reciter, and Reflections language) \*\*\*\*according to the selected language in the attached
      sheet and regardless of the user's country
- Reflection language(s) means, that when the user opens the reflections list on the ayah level, the
  list of reflections should contain the listed languages in the sheet which means getting
  reflections with the needed languages

Check the diagram https://app.diagrams.net/#G1W4AIr_1ubKlpEIi7lOKvFpILhJalH0Fn

Check the Localization and settings sheet
https://docs.google.com/spreadsheets/d/1JVgnrl4SUOULrYCvOvijjCP9JFtlP9J22Bd2urHlosI/edit?gid=591477264#gid=591477264

If you want VPN use Zenmate chrome extension
