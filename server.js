import express from "express"
import bodyParser from 'body-parser';
import { createConnectionAndModels } from "./config/database.js";
import { customHash } from "./utils/hash.js";
import PatientRouter from './routes/patients.js'
import MedicineRouter from './routes/medicines.js'

const app = express();
const port = 7000;

// MongoDB connection
export const { PatientModels, MedicineModels } = createConnectionAndModels()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send({message: "Full Sex"}))

app.use('/patients',PatientRouter);

app.use('/medicines',MedicineRouter)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
