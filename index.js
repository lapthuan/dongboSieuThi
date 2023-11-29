require("dotenv").config();
const { sqlPool, connectSQL } = require("./connect/connect_sqlserver");
const { connectMysql, mysqlConnection } = require("./connect/connect_mysql");
const { connectOracle, executeOracleQuery } = require("./connect/connect_oracle");
const express = require("express");

const cors = require("cors");
const dayjs = require("dayjs");


connectSQL();
connectMysql();
connectOracle();
const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("ok api");
});

function myFunction() {

  mysqlConnection.query(`Select * from nhanvien except SELECT nv.*
  FROM nhanvien nv
  JOIN chinhanh cn ON nv.MaCN = cn.MaCN
  WHERE nv.MaCN = 'CN01'`, (selectErr, results) => {

    results.forEach(async (row) => {

      const { MaNV, MaCN, MaCV, TenNV, NgaySinh, GioiTinh, Diachi, Sdt } = row;
      const checkNhanVien = `SELECT COUNT(*) AS COUNT FROM NHANVIEN WHERE MaNV = '${MaNV}'`;
      const sqlCheckResult = await sqlPool.request().query(checkNhanVien);

      if (sqlCheckResult.recordset[0].COUNT == 0) {

        connectSQL();
        const insertQuery = `INSERT INTO nhanvien VALUES ('${MaNV}', '${MaCN}','${MaCV}', '${TenNV}','${dayjs(NgaySinh).format('YYYY/MM/DD')}','${GioiTinh}','${Diachi}','${Sdt}')`;

        sqlPool.request().query(insertQuery, (insertErr) => {
          if (insertErr) {
            console.error('Lỗi thêm dữ liệu vào SQL Server:', insertErr);
          } else {
            console.log(`Dữ liệu với MaNV ${MaNV} đã được thêm vào SQL Server`);
          }
        });
      }

    });

  });
  mysqlConnection.query(`Select * from khachhang except SELECT kh.*
  FROM khachhang kh
  JOIN chinhanh cn ON kh.MaCN = cn.MaCN
  WHERE kh.MaCN = 'CN01'`, (selectErr, results) => {
    results.forEach(async (row) => {
      const { MaKH, MaCN, TenKH, NgaySinh, GioiTinh, Diachi, Sdt } = row;
      const checkKhachHang = `SELECT COUNT(*) AS COUNT FROM khachhang WHERE MaKH = '${MaKH}'`;
      const sqlCheckResult = await sqlPool.request().query(checkKhachHang);

      if (sqlCheckResult.recordset[0].COUNT == 0) {
        connectSQL();
        const insertQuery = `INSERT INTO khachhang VALUES ('${MaKH}', '${MaCN}', '${TenKH}','${dayjs(NgaySinh).format('YYYY/MM/DD')}','${GioiTinh}','${Diachi}','${Sdt}')`;

        sqlPool.request().query(insertQuery, (insertErr) => {
          if (insertErr) {
            console.error('Lỗi thêm dữ liệu vào SQL Server:', insertErr);
          } else {
            console.log(`Dữ liệu với MaKH ${MaKH} đã được thêm vào SQL Server`);
          }
        });
      }

    });

  });
  mysqlConnection.query(`Select * from kho except SELECT k.*
  FROM kho k
  JOIN chinhanh cn ON k.MaCN = cn.MaCN
  WHERE k.MaCN = 'CN01'`, (selectErr, results) => {

    results.forEach(async (row) => {
      const { MaKho, MaCN, TenKho, DiaChi } = row;
      const checkKho = `SELECT COUNT(*) AS COUNT FROM kho WHERE MaKho = '${MaKho}'`;
      const sqlCheckResult = await sqlPool.request().query(checkKho);

      if (sqlCheckResult.recordset[0].COUNT == 0) {
        connectSQL();
        const insertQuery = `INSERT INTO kho VALUES ('${MaKho}', '${MaCN}', '${TenKho}','${DiaChi}')`;

        sqlPool.request().query(insertQuery, (insertErr) => {
          if (insertErr) {
            console.error('Lỗi thêm dữ liệu vào SQL Server:', insertErr);
          } else {
            console.log(`Dữ liệu với MaKho ${MaKho} đã được thêm vào SQL Server`);
          }
        });
      }

    });

  });

  mysqlConnection.query(`SELECT k.*
  FROM kho k
  JOIN chinhanh cn ON k.MaCN = cn.MaCN
  WHERE k.MaCN = 'CN01'`, (selectErr, results) => {

    results.forEach(async (row) => {
      const { MaKho, MaCN, TenKho, DiaChi } = row;
      const checkKho = await executeOracleQuery(
        `SELECT COUNT(*) AS COUNT FROM kho WHERE MaKho = :MaKho`,
        [MaKho]
      );

      if (checkKho.rows[0][0] == 0) {
        console.log('row', row)
        const insertQuery = "INSERT INTO kho (MaKho, MaCN, TENKHO, DiaChi) VALUES (:1,:2,:3,:4)";

        const resultsOracel = await executeOracleQuery(insertQuery, [
          MaKho, MaCN, TenKho, DiaChi
        ]);
        console.log('resultsOracel', resultsOracel)
      }
    });
  });

  mysqlConnection.query(`SELECT nv.*
    FROM nhanvien nv
    JOIN chinhanh cn ON nv.MaCN = cn.MaCN
    WHERE nv.MaCN = 'CN01'`, (selectErr, results) => {
    results.forEach(async (row) => {
      const { MaNV, MaCN, MaCV, TenNV, NgaySinh, GioiTinh, Diachi, Sdt } = row;
      const checkNhanVien = await executeOracleQuery(
        `SELECT COUNT(*) AS COUNT FROM NHANVIEN WHERE MaNV = :MaNV`,
        [MaNV]
      );


      if (checkNhanVien.rows[0][0] == 0) {
        console.log('row', row)
        const insertQuery = "INSERT INTO nhanvien (MaNV, MaCN, TenNV, NgaySinh, GioiTinh, Diachi, Sdt,MaCV) VALUES (:1, :2,:3,TO_DATE(:4, 'yyyy-mm-dd'),:5,:6,:7,:8)";

        const resultsOracel = await executeOracleQuery(insertQuery, [
          MaNV, MaCN, TenNV, dayjs(NgaySinh).format('YYYY/MM/DD'), GioiTinh, Diachi, Sdt, MaCV
        ]);
        console.log('resultsOracel', resultsOracel)
      }
    });
  });
  mysqlConnection.query(`SELECT kh.*
  FROM khachhang kh
  JOIN chinhanh cn ON kh.MaCN = cn.MaCN
  WHERE kh.MaCN = 'CN01'`, (selectErr, results) => {
    results.forEach(async (row) => {
      const { MaKH, MaCN, TenKH, NgaySinh, GioiTinh, Diachi, Sdt } = row;
      const checkKhachHang = await executeOracleQuery(
        `SELECT COUNT(*) AS COUNT FROM KHACHHANG WHERE MaKH = :MaKH`,
        [MaKH]
      );

      if (checkKhachHang.rows[0][0] == 0) {
        console.log('row', row);
        const insertQuery = "INSERT INTO khachhang (MaKH, MaCN, TenKH, NgaySinh, GioiTinh, Diachi, Sdt) VALUES (:1, :2, :3, TO_DATE(:4, 'yyyy-mm-dd'), :5, :6, :7)";

        const resultsOracle = await executeOracleQuery(insertQuery, [
          MaKH, MaCN, TenKH, dayjs(NgaySinh).format('YYYY/MM/DD'), GioiTinh, Diachi, Sdt
        ]);
        console.log('resultsOracle', resultsOracle);
      }
    });
  });

}
setInterval(myFunction, 10000);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).send({ message: err, message });
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
