# Library Management System with Next, React, Chakra, and Redux

## Tech Stack

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front-End        | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Chakra](https://img.shields.io/badge/chakra-%234ED1C5.svg?style=for-the-badge&logo=chakraui&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white) |
| Back-End         | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)                                                                                                                          |
| Database         | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)                                                                                                                                                                                                                                                                                                                                                |
| State-Management | ![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)                                                                                                                                                                                                                                                                                                                                                      |
| Tools            | ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)                                                                                                                                                                                                                                                                                                                                                       |
| Others           | ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)                                                                                                                                                                                                                                                                                                                                                                    |

## Setup

### Environment Variables

1. Open `.env.example`
2. Fill-up the variables

```bash
#NEXT_PUBLIC_BASE_URL is the base url of the website, e.g. http://localhost:3000
NEXT_PUBLIC_BASE_URL=#Website Base URL e.g. http://localhost:3000

#NEXT_PUBLIC_API_ENDPOINT is the base url of the api, e.g. http://localhost:3000/api
NEXT_PUBLIC_API_ENDPOINT=#API Endpoint Base URL e.g. http://localhost:3000/api

#NEXT_PUBLIC_JWT_SECRET_KEY is the secret key used to generate JWT tokens, e.g. Hello
NEXT_PUBLIC_JWT_SECRET_KEY=#JWT Generator Secret Key e.g. Hello

#MONGODB_URI is the endpoint of the MongoDB database, e.g. mongodb://0.0.0.0:27017/library-db
MONGODB_URI=#MongoDB Database Endpoint e.g. mongodb://0.0.0.0:27017/library-db
NEXT_PUBLIC_MONGODB_NAME=#MongoDB Database Name e.g. library-db
```

3. Rename `.env.example` to `.env.local`

### Running the Software

1. Install the dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

2. Run Development Build

```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

3. Go to development build (e.g. [http://localhost:3000/](http://localhost:3000))

### Running Production

1. Create Production Build

```bash
# Using npm
npm run build

# Using yarn
yarn build
```

2. Run Production

```bash
# Using npm
npm run start

# Using yarn
yarn build
```

3. Go to production build (e.g. [http://localhost:3000/](http://localhost:3000))
