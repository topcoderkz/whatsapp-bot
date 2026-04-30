# SETUP.md — Полная инструкция по установке и запуску

Эта инструкция написана максимально подробно. Следуйте шаг за шагом.

---

## Что нам понадобится

Прежде чем начать, убедитесь что на вашем компьютере установлены:

1. **Node.js** (версия 20 или выше)
2. **Docker Desktop** (для базы данных)
3. **pnpm** (менеджер пакетов)
4. **Git** (для скачивания кода)

### Как проверить что всё установлено

Откройте терминал (на Mac: найдите "Terminal" в Spotlight, на Windows: откройте PowerShell) и напишите эти команды по одной:

```bash
node --version
```
Должно показать что-то вроде `v20.x.x` или `v22.x.x`. Если ошибка — скачайте Node.js с https://nodejs.org (выберите LTS версию).

```bash
docker --version
```
Должно показать `Docker version 2x.x.x`. Если ошибка — скачайте Docker Desktop с https://www.docker.com/products/docker-desktop/

```bash
pnpm --version
```
Если ошибка — установите pnpm командой:
```bash
npm install -g pnpm
```

```bash
git --version
```
Должно показать `git version 2.x.x`. Если ошибка — скачайте с https://git-scm.com

---

## Шаг 1: Скачиваем проект

```bash
git clone <URL_вашего_репозитория> whatsapp-bot
cd whatsapp-bot
```

Если проект уже скачан — просто зайдите в папку:
```bash
cd whatsapp-bot
```

---

## Шаг 2: Запускаем базу данных

Docker Desktop **должен быть запущен** (откройте приложение Docker Desktop, подождите пока появится зелёный значок).

Потом в терминале:

```bash
docker-compose up -d
```

Эта команда запустит две вещи:
- **PostgreSQL** — основная база данных (порт 5432)
- **Redis** — хранилище сессий (порт 6379)

Как проверить что работает:
```bash
docker-compose ps
```
Должно показать два контейнера со статусом `Up`.

Если увидели ошибку `port 5432 already in use` — значит у вас уже запущен PostgreSQL. Либо остановите его, либо измените порт в `docker-compose.yml`.

---

## Шаг 3: Настраиваем переменные окружения

Скопируйте файл с настройками:

```bash
cp .env.example .env
cp .env packages/bot/.env
cp .env packages/admin/.env
```

Что получилось: три одинаковых файла `.env` (один в корне, один в папке бота, один в папке админки). Бот и админка читают настройки каждый из своей папки.

**Пока ничего менять не нужно** — настройки по умолчанию работают для локальной разработки. WhatsApp API работает в режиме "заглушки" (все сообщения просто печатаются в консоль).

---

## Шаг 4: Устанавливаем зависимости

```bash
pnpm install
```

Это скачает все необходимые библиотеки. Подождите пару минут.

Если появится предупреждение про `approve-builds` — это нормально, можно игнорировать.

---

## Шаг 5: Создаём таблицы в базе данных

```bash
cd packages/bot
npx prisma migrate dev
```

Спросит название миграции — напишите `init` и нажмите Enter.

Должно показать:
```
Your database is now in sync with your schema.
```

---

## Шаг 6: Заполняем базу данных начальными данными

Всё ещё в папке `packages/bot`:

```bash
npx prisma db seed
```

Должно показать:
```
Seeded: 4 branches, 28 memberships, 1 admin user
```

Это значит в базу добавлены:
- 4 филиала (Байзакова, Кожамкулова, Кабанбай батыра, Макатаева)
- 28 тарифов (по 7 на каждый филиал)
- 1 администратор (логин: `admin`, пароль: `changeme`)

Вернитесь в корень проекта:
```bash
cd ../..
```

---

## Шаг 7: Запускаем!

```bash
pnpm dev
```

Эта команда запускает одновременно:
- **Бот** на http://localhost:3000
- **Админ-панель** на http://localhost:3001

### Проверяем бот

Откройте в браузере: http://localhost:3000/health

Должно показать:
```json
{"status":"ok","mock":true}
```

`"mock":true` означает что бот работает в режиме заглушки (не отправляет реальные сообщения в WhatsApp).

### Проверяем админ-панель

Откройте в браузере: http://localhost:3001

Появится страница входа. Введите:
- Логин: `admin`
- Пароль: `changeme`

Вы попадёте в панель управления. Попробуйте:
1. Зайти в "Цены" — увидите матрицу цен по всем филиалам
2. Нажать на любую цену — можно изменить прямо на месте
3. Зайти в "Филиалы" — увидите все 4 филиала с адресами

---

## Как тестировать бот без WhatsApp

Бот принимает сообщения через вебхук (POST запрос). Вы можете имитировать сообщения от пользователя с помощью curl.

### Имитация сообщения "Привет"

Откройте **новый терминал** (бот должен продолжать работать в первом) и выполните:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "test"
          },
          "contacts": [{
            "profile": { "name": "Тестовый Пользователь" },
            "wa_id": "77001234567"
          }],
          "messages": [{
            "from": "77001234567",
            "id": "msg1",
            "timestamp": "1234567890",
            "type": "text",
            "text": { "body": "Привет" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

Посмотрите в первый терминал (где запущен бот) — там появится `[WhatsApp MOCK] Sending message:` с текстом приветственного сообщения и списком меню.

### Имитация нажатия кнопки "Узнать цены"

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "test"
          },
          "contacts": [{
            "profile": { "name": "Тестовый Пользователь" },
            "wa_id": "77001234567"
          }],
          "messages": [{
            "from": "77001234567",
            "id": "msg2",
            "timestamp": "1234567890",
            "type": "interactive",
            "interactive": {
              "type": "list_reply",
              "list_reply": {
                "id": "menu_prices",
                "title": "Узнать цены"
              }
            }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

В консоли бота появится сообщение с ценами.

---

## Как посмотреть базу данных

Prisma Studio — это визуальный просмотрщик базы данных. Запустите в **новом терминале**:

```bash
cd packages/bot
npx prisma studio
```

Откроется браузер на http://localhost:5555 — там можно смотреть и редактировать все таблицы: филиалы, цены, клиенты, записи, рассылки.

---

## Подключение настоящего WhatsApp

Когда будете готовы подключить бота к настоящему WhatsApp:

### 1. Создайте Meta Business Account

1. Зайдите на https://business.facebook.com
2. Создайте бизнес-аккаунт (понадобится ИИН/БИН компании)
3. Подтвердите бизнес (может занять 1-2 дня)

### 2. Настройте WhatsApp Business API

1. Зайдите на https://developers.facebook.com
2. Нажмите "Мои приложения" → "Создать приложение"
3. Выберите тип "Business" → дайте имя → создайте
4. В меню слева найдите "WhatsApp" → нажмите "Настроить"
5. Вам дадут:
   - **Phone Number ID** (ID номера телефона)
   - **Access Token** (токен доступа)

### 3. Привяжите номер телефона

**ВАЖНО:** Номер для бота (+77086406121) зарегистрирован на WhatsApp Cloud API и **НЕ может** быть одновременно использован в обычном WhatsApp или WhatsApp Business на телефоне.

Другие номера филиалов (+77752899276 для Байзакова и т.д.) свободны для использования менеджерами на их телефонах.

### 4. Создайте шаблоны сообщений

В Meta Business Manager → WhatsApp Manager → Шаблоны сообщений, создайте:

**Шаблон 1: `booking_notification`** (для уведомления менеджера)
- Категория: Utility
- Язык: Русский
- Текст: `Новая запись! Филиал: {{1}}, Телефон клиента: {{2}}, Тип: {{3}}, Дата: {{4}}, Время: {{5}}`

**Шаблон 2: `booking_confirmation`** (для подтверждения клиенту)
- Категория: Utility
- Язык: Русский
- Текст: `Ваша запись подтверждена! Филиал: {{1}}, Дата: {{2}}, Время: {{3}}. Ждём вас!`

**Шаблон 3: `broadcast_message`** (для рассылок)
- Категория: Marketing
- Язык: Русский
- Текст: `{{1}}`

Шаблоны проходят модерацию Meta — обычно 24-48 часов.

### 5. Обновите .env файлы

Откройте `.env` в корне проекта и замените:

```env
WHATSAPP_ACCESS_TOKEN=ваш_токен_из_meta
WHATSAPP_PHONE_NUMBER_ID=id_номера_телефона_бота
WHATSAPP_VERIFY_TOKEN=придумайте_любой_секретный_текст
```

**Production**: эти значения хранятся в `infrastructure/terraform.tfvars`, НЕ в .env файлах.

Потом скопируйте во все три места:
```bash
cp .env packages/bot/.env
cp .env packages/admin/.env
```

### 6. Настройте вебхук

В Meta Developer Console → WhatsApp → Configuration:

- **Callback URL**: `https://fitness-bot-y55ljl45uq-uc.a.run.app/webhook`
- **Verify Token**: тот же текст что вы написали в `WHATSAPP_VERIFY_TOKEN`
- **Webhook fields**: поставьте галочку на `messages`

Для тестирования без домена можно использовать **ngrok**:
```bash
# Установите ngrok: https://ngrok.com
ngrok http 3000
```
Ngrok даст вам временный URL вида `https://abc123.ngrok.io` — используйте его как Callback URL.

---

## Деплой на Google Cloud (рекомендуемый)

Проект настроен для автоматического деплоя через Google Cloud Build → Cloud Run.

### 1. Создайте GCP проект

```bash
# Войдите под нужным аккаунтом
gcloud auth login    # откроется браузер — войдите под iluhaha1984@gmail.com

# Создайте проект (замените PROJECT_ID на уникальное имя)
gcloud projects create fitness-bot-prod --name="100% Fitness Bot"

# Переключитесь на новый проект
gcloud config set project fitness-bot-prod

# Привяжите биллинг (нужна карта)
# Зайдите на https://console.cloud.google.com/billing и привяжите проект к биллинг-аккаунту
```

### 2. Создайте бакет для Terraform state

```bash
gcloud storage buckets create gs://fitness-bot-prod-tf-state --location=us-central1
```

Потом откройте `infrastructure/providers.tf` и впишите имя бакета:
```hcl
backend "gcs" {
  bucket = "fitness-bot-prod-tf-state"   # ← вот сюда
  prefix = "fitness-bot"
}
```

### 3. Настройте Terraform переменные

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars    # заполните все значения
```

Обязательно заполните:
- `project_id` — ID вашего GCP проекта
- `db_password` — придумайте сложный пароль
- `admin_jwt_secret` — длинная случайная строка (можно сгенерировать: `openssl rand -hex 32`)

### 4. Разверните инфраструктуру

```bash
# Установите Terraform: https://developer.hashicorp.com/terraform/install
terraform init
terraform plan        # посмотрите что будет создано
terraform apply       # создайте всё (напишите "yes")
```

Terraform создаст:
- Cloud SQL PostgreSQL (база данных)
- Cloud Run (2 сервиса: бот + админка)
- Artifact Registry (хранилище Docker образов)
- Service Account + IAM роли
- Secret Manager (для DATABASE_URL в CI/CD)

В конце покажет URLs:
```
bot_url    = "https://fitness-bot-y55ljl45uq-uc.a.run.app"
admin_url  = "https://fitness-admin-y55ljl45uq-uc.a.run.app"
webhook_url = "https://fitness-bot-y55ljl45uq-uc.a.run.app/webhook"
```

Админ-панель также доступна по домену **admin.100fitnessgym.kz** (Cloud Run domain mapping + SSL от Google).

Бот работает с min 1 instance (нет холодных стартов, отвечает мгновенно).

### 5. Подключите GitHub → Cloud Build

```bash
# Подключите GitHub репозиторий в Cloud Build console:
# https://console.cloud.google.com/cloud-build/triggers
# Нажмите "Connect Repository" → GitHub → выберите whatsapp-bot

# Или через CLI:
gcloud builds triggers create github \
  --repo-name=whatsapp-bot \
  --repo-owner=topcoderkz \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --region=us-central1
```

### 6. Запустите первый деплой

После подключения GitHub — просто сделайте push в main:
```bash
git push origin main
```

Cloud Build автоматически:
1. Соберёт Docker образы (бот + админка)
2. Загрузит их в Artifact Registry
3. Запустит миграции БД
4. Задеплоит оба сервиса в Cloud Run

Следите за процессом: https://console.cloud.google.com/cloud-build/builds

### 7. Засейте базу данных (первый раз)

После первого деплоя базу нужно заполнить начальными данными:

```bash
# Подключитесь к Cloud SQL через прокси
gcloud sql connect fitness-bot-db --user=fitness --database=fitness_bot

# Или запустите seed локально, подключившись к Cloud SQL:
# 1. Установите Cloud SQL Proxy: https://cloud.google.com/sql/docs/postgres/connect-auth-proxy
# 2. Запустите прокси:
cloud-sql-proxy fitness-bot-prod:us-central1:fitness-bot-db
# 3. В другом терминале:
DATABASE_URL="postgresql://fitness:ВАШ_ПАРОЛЬ@localhost:5432/fitness_bot" npx prisma db seed
```

### 8. Настройте Redis

Для Redis в production рекомендуем **Upstash** (бесплатный план достаточен):

1. Зайдите на https://upstash.com → создайте аккаунт
2. Создайте Redis базу (регион: US Central, если Cloud Run в us-central1)
3. Скопируйте Redis URL (формат: `redis://default:XXX@endpoint.upstash.io:6379`)
4. Добавьте в terraform.tfvars: `redis_url = "redis://..."`
5. Запустите `terraform apply`

### 9. Настройте хранилище изображений (GCS)

Для загрузки фото тренеров и изображений акций через админку:

1. Создайте бакет в Google Cloud Storage:
```bash
gcloud storage buckets create gs://fitness-bot-uploads --location=us-central1 --uniform-bucket-level-access
```

2. Сделайте объекты публично доступными (изображения для бота):
```bash
gcloud storage buckets add-iam-policy-binding gs://fitness-bot-uploads \
  --member=allUsers --role=roles/storage.objectViewer
```

3. Дайте сервисному аккаунту Cloud Run право на запись:
```bash
gcloud storage buckets add-iam-policy-binding gs://fitness-bot-uploads \
  --member=serviceAccount:ВАШ_SERVICE_ACCOUNT@ВАШ_ПРОЕКТ.iam.gserviceaccount.com \
  --role=roles/storage.objectCreator
```

4. Добавьте переменную окружения в Cloud Run (сервис админки):
```bash
gcloud run services update fitness-admin --region=us-central1 \
  --set-env-vars="GCS_BUCKET_NAME=fitness-bot-uploads"
```

Для локальной разработки бакет не нужен — изображения сохраняются в `packages/admin/public/uploads/`.

### Стоимость в месяц

| Сервис | Стоимость |
|--------|-----------|
| Cloud Run бот (min 1 instance, всегда включён) | ~$5-10 |
| Cloud Run админка (min 0, scale to zero) | $0-1 |
| Cloud SQL (db-f1-micro) | ~$7 |
| Artifact Registry | ~$0.10 |
| Cloud Storage (изображения) | ~$0.01 |
| Upstash Redis (free tier) | $0 |
| **Итого** | **~$12-18** |

---

## Альтернативные варианты деплоя

### Вариант: Railway (самый простой)

1. Зайдите на https://railway.app и войдите через GitHub
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите ваш репозиторий
4. Railway автоматически определит что это Node.js проект
5. Добавьте сервисы:
   - PostgreSQL (кнопка "Add Database")
   - Redis (кнопка "Add Database")
6. В настройках проекта → Variables, добавьте все переменные из `.env`
   - `DATABASE_URL` подставится автоматически от PostgreSQL сервиса
   - `REDIS_URL` подставится автоматически от Redis сервиса
7. Создайте два сервиса:
   - Бот: Root Directory = `packages/bot`, Start Command = `npx prisma migrate deploy && node dist/index.js`, Build Command = `npx prisma generate && tsc`
   - Админка: Root Directory = `packages/admin`, Start Command = `next start -p 3001`, Build Command = `next build`

### Вариант 2: VPS (Ubuntu)

Если у вас есть сервер (например от Hetzner, DigitalOcean, или Timeweb):

```bash
# 1. Подключитесь к серверу
ssh root@ваш-ip

# 2. Установите Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 3. Установите pnpm
npm install -g pnpm

# 4. Установите Docker
curl -fsSL https://get.docker.com | sh

# 5. Установите Nginx (для HTTPS)
apt-get install -y nginx certbot python3-certbot-nginx

# 6. Скачайте проект
git clone <URL_репозитория> /opt/whatsapp-bot
cd /opt/whatsapp-bot

# 7. Настройте .env
cp .env.example .env
nano .env    # заполните все значения
cp .env packages/bot/.env
cp .env packages/admin/.env

# 8. Запустите базу данных
docker-compose up -d

# 9. Установите зависимости и соберите
pnpm install
cd packages/bot && npx prisma migrate deploy && npx prisma db seed && cd ../..
pnpm build

# 10. Установите PM2 для автозапуска
npm install -g pm2

# 11. Запустите бот
pm2 start packages/bot/dist/index.js --name "fitness-bot"

# 12. Запустите админку
cd packages/admin && pm2 start npm --name "fitness-admin" -- start
cd ../..

# 13. Сохраните конфигурацию PM2 (будет работать после перезагрузки)
pm2 save
pm2 startup
```

Настройте Nginx для HTTPS:

```bash
# Создайте конфиг
nano /etc/nginx/sites-available/fitness-bot
```

Вставьте:
```nginx
server {
    listen 80;
    server_name bot.ваш-домен.kz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name admin.ваш-домен.kz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Активируйте конфиг
ln -s /etc/nginx/sites-available/fitness-bot /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Получите HTTPS сертификат (бесплатно)
certbot --nginx -d bot.ваш-домен.kz -d admin.ваш-домен.kz
```

---

## Обслуживание

### Как обновить код на сервере

```bash
cd /opt/whatsapp-bot
git pull
pnpm install
pnpm build
cd packages/bot && npx prisma migrate deploy && cd ../..
pm2 restart all
```

### Как посмотреть логи

```bash
# Логи бота
pm2 logs fitness-bot

# Логи админки
pm2 logs fitness-admin

# Последние 100 строк
pm2 logs fitness-bot --lines 100
```

### Как сделать бэкап базы данных

```bash
# Создать бэкап
docker exec whatsapp-bot-postgres-1 pg_dump -U fitness fitness_bot > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
docker exec -i whatsapp-bot-postgres-1 psql -U fitness fitness_bot < backup_20260424.sql
```

Рекомендуем делать бэкап каждый день. Добавьте в crontab:
```bash
crontab -e
```
Добавьте строку:
```
0 3 * * * docker exec whatsapp-bot-postgres-1 pg_dump -U fitness fitness_bot > /opt/backups/fitness_$(date +\%Y\%m\%d).sql
```
Это будет делать бэкап каждый день в 3 утра.

### Как перезапустить всё

```bash
docker-compose restart    # перезапустить базу данных
pm2 restart all           # перезапустить бот и админку
```

### Как остановить всё

```bash
pm2 stop all              # остановить бот и админку
docker-compose stop       # остановить базу данных
```

---

## Частые проблемы

### "port 3000 already in use"
Что-то уже работает на порту 3000. Найдите и убейте процесс:
```bash
lsof -ti :3000 | xargs kill -9
```

### "Connection refused" при подключении к базе
Docker не запущен. Запустите Docker Desktop, подождите минуту, потом:
```bash
docker-compose up -d
```

### Админка показывает "Ошибка подключения к базе данных"
Проверьте что `.env` файл есть в `packages/admin/` и что там правильный `DATABASE_URL`.

### Бот не отвечает в WhatsApp
1. Проверьте что `WHATSAPP_ACCESS_TOKEN` не пустой в `.env`
2. Проверьте что вебхук настроен правильно в Meta Developer Console
3. Посмотрите логи: `pm2 logs fitness-bot` (для Cloud Run: см. ниже)
4. Если ошибка **401 Authentication Error** — токен истёк или был инвалидирован (например, при удалении номера из Meta). Сгенерируйте новый токен в Meta Business Suite → System Users и обновите в `terraform.tfvars`
5. Если бот отвечает медленно (3-10 сек) — это холодный старт. Проверьте что `min_instance_count = 1` в terraform

### Ошибка CORS при навигации в админ-панели
Кнопка "Выйти" использует обычный `<a>` тег (не Next.js `<Link>`) чтобы избежать prefetch-ошибок. Logout редиректит на собственный домен через заголовки `Host` + `X-Forwarded-Proto`. Если всё равно есть CORS — проверьте что `packages/admin/src/app/api/logout/route.ts` не использует `request.nextUrl` (он содержит `0.0.0.0:8080` на Cloud Run).

### Ошибки WhatsApp API
- **(#100) Invalid parameter** — проверьте формат сообщений: список максимум 10 строк, кнопки максимум 3, заголовки кнопок до 20 символов
- **(#131005) Access denied** — токен не имеет нужных разрешений (`whatsapp_business_messaging`)
- **401 Authentication Error** — токен истёк, сгенерируйте новый в Meta Business Suite

### Логи в production (Cloud Run)
```bash
# Логи бота
gcloud logging read 'resource.type="cloud_run_revision" resource.labels.service_name="fitness-bot"' --limit 50

# Логи админки
gcloud logging read 'resource.type="cloud_run_revision" resource.labels.service_name="fitness-admin"' --limit 50

# Перезапуск сервиса
gcloud run services update fitness-bot --region us-central1 --no-traffic --tag temp
gcloud run services update-traffic fitness-bot --region us-central1 --to-latest
```

### Менеджер не получает уведомления о записи
1. Проверьте что шаблон `booking_notification` одобрен в Meta
2. Проверьте что номер менеджера правильный в разделе "Филиалы" админки
3. Посмотрите таблицу `notification_logs` в Prisma Studio — там будет статус и ошибка

### Как сменить пароль админки
Откройте Prisma Studio (`npx prisma studio` в `packages/bot`), найдите таблицу `admin_users`, измените `password_hash`. Чтобы сгенерировать хеш нового пароля:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('ваш_новый_пароль', 10).then(h => console.log(h))"
```
Скопируйте результат в поле `password_hash`.

---

## Структура проекта (для разработчиков)

```
whatsapp-bot/
├── packages/
│   ├── bot/                        # WhatsApp бот (Express + TypeScript)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Схема базы данных
│   │   │   ├── seed.ts             # Начальные данные
│   │   │   └── migrations/         # Миграции БД
│   │   └── src/
│   │       ├── index.ts            # Точка входа (Express сервер)
│   │       ├── config.ts           # Настройки из .env
│   │       ├── whatsapp/           # WhatsApp API клиент и вебхук
│   │       ├── conversation/       # Движок диалогов (машина состояний)
│   │       ├── screens/            # Экраны бота (каждый файл = 1 экран)
│   │       ├── services/           # Бизнес-логика (записи, уведомления)
│   │       ├── routes/             # API для админки
│   │       ├── jobs/               # Фоновые задачи (очистка, истечение)
│   │       ├── db/                 # Подключение к PostgreSQL
│   │       └── redis/              # Подключение к Redis (сессии)
│   │
│   └── admin/                      # Админ-панель (Next.js 15)
│       └── src/
│           ├── app/                # Страницы (каждая папка = 1 страница)
│           │   ├── api/upload/     # Загрузка изображений (GCS / локально)
│           │   ├── login/          # Вход
│           │   ├── branches/       # Филиалы (часы работы — двойной таймпикер)
│           │   ├── pricing/        # Цены (инлайн-редактирование)
│           │   ├── trainers/       # Тренеры (карточки, инлайн-редактирование, загрузка фото)
│           │   ├── classes/        # Групповые занятия (карточки, визуальное расписание)
│           │   ├── promotions/     # Акции (загрузка изображений)
│           │   ├── bookings/       # Записи
│           │   ├── clients/        # Клиенты + импорт CSV (формат: ФИО;Телефон)
│           │   └── broadcasts/     # Рассылки (создание, редактирование, отправка)
│           ├── components/         # Переиспользуемые компоненты
│           │   ├── image-upload.tsx       # Загрузка изображений (drag-and-drop)
│           │   ├── schedule-editor.tsx    # Визуальный редактор расписания
│           │   └── working-hours-input.tsx # Часы работы (от — до)
│           └── lib/                # Утилиты (БД, авторизация, экшены)
│
├── Dockerfile                      # Docker: бот
├── Dockerfile.admin                # Docker: админка
├── cloudbuild.yaml                 # CI/CD: Google Cloud Build
├── infrastructure/                 # Terraform: GCP инфраструктура
│   ├── main.tf                     # Cloud SQL, Cloud Run, IAM
│   ├── cicd.tf                     # Artifact Registry, Cloud Build IAM
│   ├── variables.tf                # Переменные
│   └── outputs.tf                  # URLs сервисов
├── docker-compose.yml              # PostgreSQL + Redis (локальная разработка)
├── .env.example                    # Шаблон настроек
└── CLAUDE.md                       # Техническая документация
```

---

## Контакты

Если что-то не работает или непонятно — свяжитесь с разработчиком, который настраивал этот проект.
