import express from "express"
import bodyParser from 'body-parser';
import { createConnectionAndModels } from "./config/database.js";
import PatientRouter from './routes/patients.js'
import MedicineRouter from './routes/medicines.js'
import cors from 'cors'
import { UserRouter } from "./routes/user.js";




const app = express();
const port = 7000;

// MongoDB connection
export const { PatientModels, MedicineModels } = await createConnectionAndModels()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
app.get('/', (req, res) => res.send({message: "Working"}))

app.use('/patients',PatientRouter);
app.use('/medicines',MedicineRouter)
app.use('/user',UserRouter)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
