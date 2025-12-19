// ================================
// Travel Planner Backend (Node.js)
// ================================
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // 🔸 Change if needed
  password: "Network@#$15", // 🔸 Change to your MySQL password
  database: "travel" // 🔸 Database name
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// =============================================
// API ROUTES (You can add more custom queries)
// =============================================

// 1️⃣ Get all admins
app.get("/api/admins", (req, res) => {
  const sql = "SELECT * FROM admin;";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 2️⃣ Get all users with their admin info
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT u.user_id, u.name AS user_name, a.name AS admin_name
    FROM user u
    LEFT JOIN admin a ON u.admin_id = a.admin_id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 3️⃣ Get all trips for each user
app.get("/api/trips", (req, res) => {
  const sql = `
    SELECT t.trip_id, t.trip_name, t.destination, u.name AS user_name
    FROM trip t
    JOIN user u ON t.user_id = u.user_id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 4️⃣ Total expense per trip
app.get("/api/trip-expenses", (req, res) => {
  const sql = `
    SELECT t.trip_id, t.trip_name, SUM(e.amount) AS total_expense
    FROM expense e
    JOIN trip t ON e.trip_id = t.trip_id
    GROUP BY t.trip_id, t.trip_name;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Login route - authenticate user
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM user WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json(result[0]);
  });
});

// Signup route - register new user
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required" });
  }

  const checkSql = "SELECT user_id FROM user WHERE email = ?";
  db.query(checkSql, [email], (checkErr, existing) => {
    if (checkErr) return res.status(500).send(checkErr);

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const insertSql = `
      INSERT INTO user (name, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [name, email, password], (insertErr, result) => {
      if (insertErr) return res.status(500).send(insertErr);

      const newUser = {
        user_id: result.insertId,
        name,
        email
      };

      res.status(201).json(newUser);
    });
  });
});

// =============================================
// USER ROUTES
// =============================================

// Get user data by user_id
app.get("/api/user/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT u.*, a.name AS admin_name 
    FROM user u 
    LEFT JOIN admin a ON u.admin_id = a.admin_id 
    WHERE u.user_id = ?
  `;
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result[0]);
  });
});

// Get all trips for a specific user
app.get("/api/user/:user_id/trips", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT t.*, 
           COUNT(DISTINCT e.expense_id) AS expense_count,
           COALESCE(SUM(e.amount), 0) AS total_expenses
    FROM trip t
    LEFT JOIN expense e ON t.trip_id = e.trip_id
    WHERE t.user_id = ?
    GROUP BY t.trip_id
    ORDER BY t.start_date DESC
  `;
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// =============================================
// TRIP ROUTES
// =============================================

// Get trip details by trip_id
app.get("/api/trip/:trip_id", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT t.*, u.name AS user_name, u.email AS user_email
    FROM trip t
    JOIN user u ON t.user_id = u.user_id
    WHERE t.trip_id = ?
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(result[0]);
  });
});

// Get itinerary items for a trip
app.get("/api/trip/:trip_id/itinerary", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT * FROM itinerary_item 
    WHERE trip_id = ? 
    ORDER BY date, time
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get accommodations for a trip
app.get("/api/trip/:trip_id/accommodations", (req, res) => {
  const { trip_id } = req.params;
  const sql = `SELECT * FROM accommodation WHERE trip_id = ? ORDER BY check_in`;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get transport for a trip
app.get("/api/trip/:trip_id/transport", (req, res) => {
  const { trip_id } = req.params;
  const sql = `SELECT * FROM transport WHERE trip_id = ? ORDER BY dept_date`;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get expenses for a trip
app.get("/api/trip/:trip_id/expenses", (req, res) => {
  const { trip_id } = req.params;
  const sql = `SELECT * FROM expense WHERE trip_id = ? ORDER BY date DESC`;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get budget for a trip
app.get("/api/trip/:trip_id/budget", (req, res) => {
  const { trip_id } = req.params;
  const sql = `SELECT * FROM budget WHERE trip_id = ? ORDER BY category`;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get companions for a trip
app.get("/api/trip/:trip_id/companions", (req, res) => {
  const { trip_id } = req.params;
  const sql = `SELECT * FROM companion WHERE trip_id = ? ORDER BY name`;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get city guides for a trip
app.get("/api/trip/:trip_id/city-guides", (req, res) => {
  const { trip_id } = req.params;
  const sql = `SELECT * FROM city_guide WHERE trip_id = ? ORDER BY rating DESC`;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// =============================================
// AGGREGATE QUERIES
// =============================================

// Get expenses by category for a trip (SUM with GROUP BY)
app.get("/api/trip/:trip_id/expenses-by-category", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT category, 
           SUM(amount) AS total_amount, 
           COUNT(*) AS expense_count
    FROM expense 
    WHERE trip_id = ? 
    GROUP BY category
    ORDER BY total_amount DESC
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get budget vs actual for a trip (SUM with GROUP BY)
app.get("/api/trip/:trip_id/budget-vs-actual", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT category,
           SUM(planned_amt) AS total_planned,
           SUM(actual_amt) AS total_actual,
           (SUM(planned_amt) - SUM(actual_amt)) AS difference
    FROM budget
    WHERE trip_id = ?
    GROUP BY category
    ORDER BY category
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get total expenses by payment method for a trip
app.get("/api/trip/:trip_id/expenses-by-payment", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT payment_method,
           SUM(amount) AS total_amount,
           COUNT(*) AS transaction_count
    FROM expense
    WHERE trip_id = ?
    GROUP BY payment_method
    ORDER BY total_amount DESC
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get companion expenses summary (SUM with GROUP BY)
app.get("/api/trip/:trip_id/companion-summary", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT 
           SUM(total_paid) AS total_paid_by_all,
           SUM(amount_owed) AS total_owed,
           COUNT(*) AS companion_count
    FROM companion
    WHERE trip_id = ?
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

// Get average rating of city guides for a trip
app.get("/api/trip/:trip_id/city-guide-stats", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT 
           AVG(rating) AS avg_rating,
           MAX(rating) AS max_rating,
           MIN(rating) AS min_rating,
           COUNT(*) AS total_places
    FROM city_guide
    WHERE trip_id = ?
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

// Get total transport cost by mode for a trip
app.get("/api/trip/:trip_id/transport-by-mode", (req, res) => {
  const { trip_id } = req.params;
  const sql = `
    SELECT mode,
           SUM(cost) AS total_cost,
           COUNT(*) AS trip_count
    FROM transport
    WHERE trip_id = ?
    GROUP BY mode
    ORDER BY total_cost DESC
  `;
  db.query(sql, [trip_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get user's total trip expenses across all trips (SUM with GROUP BY)
app.get("/api/user/:user_id/total-expenses", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT 
           t.trip_id,
           t.trip_name,
           t.destination,
           SUM(e.amount) AS total_expenses,
           COUNT(e.expense_id) AS expense_count
    FROM trip t
    LEFT JOIN expense e ON t.trip_id = e.trip_id
    WHERE t.user_id = ?
    GROUP BY t.trip_id, t.trip_name, t.destination
    ORDER BY total_expenses DESC
  `;
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// =============================================
// EXISTING ROUTES (kept for compatibility)
// =============================================

// Get all admins
app.get("/api/admins", (req, res) => {
  const sql = "SELECT * FROM admin;";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get all users with their admin info
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT u.user_id, u.name AS user_name, a.name AS admin_name
    FROM user u
    LEFT JOIN admin a ON u.admin_id = a.admin_id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Get all trips for each user
app.get("/api/trips", (req, res) => {
  const sql = `
    SELECT t.trip_id, t.trip_name, t.destination, u.name AS user_name
    FROM trip t
    JOIN user u ON t.user_id = u.user_id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Total expense per trip
app.get("/api/trip-expenses", (req, res) => {
  const sql = `
    SELECT t.trip_id, t.trip_name, SUM(e.amount) AS total_expense
    FROM expense e
    JOIN trip t ON e.trip_id = t.trip_id
    GROUP BY t.trip_id, t.trip_name;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 🚀 Start Server
app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));