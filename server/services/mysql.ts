import mysql from 'mysql2/promise';

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = process.env;

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
  throw new Error('Missing MySQL environment variables');
}

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export interface Patient {
  appointments_uid: string;
  appointments_drid: string;
  appointments_hoid: string;
  appointments_depid: string;
  appointments_ptid: string;
  appointments_date: string;
  appointments_time: string;
  appointments_status: string;
  appointments_notes: string;
}

export async function createPatient(patient: Patient) {
  const sql = `INSERT INTO tbl_patients (
    appointments_uid, appointments_drid, appointments_hoid, appointments_depid, appointments_ptid, appointments_date, appointments_time, appointments_status, appointments_notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    patient.appointments_uid,
    patient.appointments_drid,
    patient.appointments_hoid,
    patient.appointments_depid,
    patient.appointments_ptid,
    patient.appointments_date,
    patient.appointments_time,
    patient.appointments_status,
    patient.appointments_notes
  ];
  const [result] = await pool.execute(sql, values);
  return result;
}
