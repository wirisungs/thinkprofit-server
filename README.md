# ThinkProfit Server

This is the server-side application for ThinkProfit, built with Node.js and Express.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/wirisungs/thinkprofit-server.git
    cd thinkprofit-server
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/0) file in the root directory and add the following:
    ```env
    PORT=3000
    ```

## Usage

To start the server in development mode with hot-reloading:

```sh
npm run dev
```

The server will be running at http://localhost:3000

## Testing

To run the test:

```sh
npm test
```

## CI/CD

This project uses GitHub Actions for CI/CD. The workflow is defined in main.yml. It runs on every push and pull request to the main branch, and performs the following steps:

1. Checkout the code
2. Setup Node.js
3. Installs dependencies
4. Run tests
5. Builds the application
6. Deploys the application (deployment commands need to be added)

## Enviroment Variables

The follwing environment variables are used in this project
- PORT: The port on which the server will run (default is 3000)

## License

This project in licensed under the ISC License
