# dsci551-project

## Project Setup

### Server Setup
1. **Create a folder for your local databases:**  
   Create a folder on your local machine where your MongoDB databases will reside.

2. **Start the MongoDB server:**  
   Start the MongoDB server on ports 27017, 27018, and 27019 using the following commands:

- `mongod --port 27017 --dbpath dbpath` 
- `mongod --port 27018 --dbpath dbpath`
- `mongod --port 27019 --dbpath dbpath\Authentication`

It is imperative that you start port 27019 and at least one of ports 27017 and 27018.

### Project Setup
1. **Clone all the repositories:**  
Clone all the required repositories for your project.

2. **Navigate inside the repository:**  
`cd repo`

3. **Install dependencies:**  
`npm install`

4. **Start the development server:**  
`npm run dev`
