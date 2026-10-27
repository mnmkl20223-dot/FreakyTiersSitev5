Freaky Tiers — обновление

1. Сделай резервную копию старых файлов.
2. Замени bot.py в папке бота.
3. В репозитории сайта замени app.py, templates/index.html, static/app.js, static/style.css.
4. Отправь изменения сайта в GitHub и дождись деплоя Render.
5. Перезапусти бота.

Не удаляй ranks.json, teams.json, queue.json или базу данных сайта.
Переменные DISCORD_TOKEN, WEBSITE_SYNC_URL и WEBSITE_SYNC_SECRET остаются прежними.
Если ранее опубликованный секрет сайта ещё не сменён, сначала поменяй SITE_SYNC_SECRET в Render и WEBSITE_SYNC_SECRET в PowerShell.

После обновления запись в очередь спросит два Minecraft-ника. /setteamrank обновляет последнюю пару. Старые данные сохраняются; у старых записей может не быть Minecraft-ников.
