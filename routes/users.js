// routes/users.js
var express = require("express");
var router = express.Router();
const pool = require("../models/pg_connector"); // PostgreSQL connection

// Function to generate an HTML table from query data
function generateProductTable(rows) {
  let table = `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
        font-size: 18px;
        text-align: left;
      }
      table th, table td {
        padding: 12px 15px;
        border: 1px solid #ddd;
      }
      table tr:nth-child(even) {
        background-color: #f9fbfc;
      }
      table tr:nth-child(odd) {
        background-color: #eef3f8;
      }
      table th {
        background-color: #007BFF;
        color: white;
        text-align: center;
      }
      input[type="text"], input[type="number"] {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        margin-bottom: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      input[type="submit"] {
        background-color: #007BFF;
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 4px;
        font-weight: bold;
      }
      input[type="submit"]:hover {
        background-color: #0056b3;
      }
    </style>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Product</th>
          <th>Price</th>
          <th>Shop ID</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <form action="/users" method="POST">
            <td><input type="text" name="id" placeholder="Auto" disabled></td>
            <td><input type="text" name="product" placeholder="New product" required></td>
            <td><input type="number" name="price" placeholder="Price" required step="0.01"></td>
            <td><input type="number" name="shop_id" placeholder="Shop ID" required></td>
            <td><input type="number" name="amount" placeholder="Amount" required></td>
            <td><input type="submit" name="btn" value="Add"></td>
          </form>
        </tr>`;

  rows.forEach((row) => {
    table += `
        <tr>
          <form action="/users" method="POST">
            <td><input type="text" name="id" value="${row.id}" readonly></td>
            <td><input type="text" name="product" value="${row.product_name}" required></td>
            <td><input type="number" name="price" value="${row.price}" required step="0.01"></td>
            <td><input type="number" name="shop_id" value="${row.shop_id}" required></td>
            <td><input type="number" name="amount" value="${row.amount}" required></td>
            <td>
              <input type="submit" name="btn" value="Update">
              <input type="submit" name="btn" value="Delete">
            </td>
          </form>
        </tr>`;
  });

  table += `
      </tbody>
    </table>`;
  return table;
}

// GET users listing
router.get("/", function (req, res, next) {
  let authented = req.session.authented;

  // Check if user is authenticated
  if (!authented) {
    return res.redirect("/login");
  }

  // Query product list from database
  pool.query(
    "SELECT id, product_name, price, shop_id, amount FROM products",
    (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).send("Database query error");
      }

      // Generate product table from query result
      const table = generateProductTable(result.rows);

      // Render 'users' page with product table
      res.render("users", { title: "Users page", products_table: table });
    }
  );
});

// POST users CRUD
router.post("/", function (req, res, next) {
  const { id, product, price, shop_id, amount, btn } = req.body;

  if (btn === "Add") {
    // Add new product
    if (product && price && shop_id && amount) {
      pool.query(
        "INSERT INTO products (product_name, price, shop_id, amount) VALUES ($1, $2, $3, $4)",
        [product, price, shop_id, amount],
        (err) => {
          if (err) {
            console.error("Error adding product:", err);
            return res.status(500).send("Error adding product");
          }
          return res.redirect("/users"); // Redirect after adding
        }
      );
    } else {
      return res.status(400).send("All fields are required for adding!");
    }
  } else if (btn === "Update") {
    // Update existing product
    if (id && product && price && shop_id && amount) {
      pool.query(
        "UPDATE products SET product_name = $1, price = $2, shop_id = $3, amount = $4 WHERE id = $5",
        [product, price, shop_id, amount, id],
        (err) => {
          if (err) {
            console.error("Error updating product:", err);
            return res.status(500).send("Error updating product");
          }
          return res.redirect("/users"); // Redirect after updating
        }
      );
    } else {
      return res.status(400).send("All fields are required for updating!");
    }
  } else if (btn === "Delete") {
    // Delete product
    if (id) {
      pool.query("DELETE FROM products WHERE id = $1", [id], (err) => {
        if (err) {
          console.error("Error deleting product:", err);
          return res.status(500).send("Error deleting product");
        }
        return res.redirect("/users"); // Redirect after deleting
      });
    } else {
      return res.status(400).send("Product ID is required for deletion!");
    }
  }
});

module.exports = router;
