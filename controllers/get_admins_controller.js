const pool = require("../models/pg_connector");

async function display_admin_page(req, res) {
    if (req.session.authented && req.session.role_id <= 2) {
        let shop_id = 1;
        if (req.body.shops) {
            shop_id = parseInt(req.body.shops);
        }
        
        // Tạo bảng sản phẩm dựa trên shop_id đã chọn
        let table = await generate_table(shop_id);

        // Tạo danh sách chọn Shop để filter sản phẩm
        let dropdown_list = await generate_dropdown_list();

        // Tạo bảng users từ cơ sở dữ liệu
        let users_table = await generate_user_table();

        // Render trang admin với bảng sản phẩm, danh sách dropdown và bảng users
        res.render('admins', { 
            title: 'ADMIN PAGE',
            products_table: table, 
            droplist: dropdown_list,
            users_table: users_table // Thêm bảng users vào trang admin
        });
    } else {
        res.redirect('/');
    }
}

async function generate_table(shop_id) {
    let table = "";
    let query = "";

    // Lấy tất cả sản phẩm hoặc sản phẩm theo shop_id
    if (shop_id == 1) {
        query = `SELECT * FROM products`;
    } else {
        query = {
            text: 'SELECT * FROM products WHERE shop_id = $1',
            values: [shop_id],
        }
    }

    try {
        const result = await pool.query(query);
        const rows = result.rows;
        const fields = result.fields;

        // Tạo bảng HTML
        table = `<table border=1><tr>`;

        // Tạo tiêu đề cột
        let col_list = [];
        for (let field of fields) {
            table += `<th>${field.name}</th>`;
            col_list.push(field.name);
        }
        table += `</tr>`;

        // Tạo các hàng dữ liệu
        for (let row of rows) {
            table += `<tr>`;
            for (let col of col_list) {
                let cell = row[col];
                table += `<td>${cell}</td>`;
            }
            table += `</tr>`;
        }
        table += `</table>`;
    } catch (err) {
        console.log(err);
        table = "Cannot connect to DB";
    }
    return table;
}

async function generate_dropdown_list() {
    let dropdown_list = "";
    try {
        const query = `SELECT id, shop_name FROM shops;`;
        const result = await pool.query(query);
        const rows = result.rows;

        // Tạo danh sách dropdown cho các shop
        dropdown_list = `<form action="" method="post">
            <label for="shop">Choose a shop ID:</label>
            <select name="shops" id="shops">
            <option value=1>All shops</option>`;
        for (let row of rows) {
            if (row.id > 1) {
                dropdown_list += `<option value=${row.id}>${row.shop_name}</option>`;
            }
        }
        dropdown_list += `</select>
            <button type="submit">Select</button>
        </form>`;
    } catch (err) {
        console.log(err);
        dropdown_list = "Cannot connect to DB";
    }
    return dropdown_list;
}

// Tạo bảng users
async function generate_user_table() {
    let table = "";
    let query = "SELECT * FROM users"; // Lấy tất cả người dùng từ bảng users

    try {
        const result = await pool.query(query);
        const rows = result.rows;
        const fields = result.fields;

        // Tạo bảng HTML cho users
        table = `<table border=1><tr>`;

        // Tạo tiêu đề bảng dựa trên các cột trong bảng users
        let col_list = [];
        for (let field of fields) {
            table += `<th>${field.name}</th>`;
            col_list.push(field.name);
        }
        table += `</tr>`;

        // Tạo các hàng dữ liệu
        for (let row of rows) {
            table += `<tr>`;
            for (let col of col_list) {
                let cell = row[col];
                table += `<td>${cell}</td>`;
            }
            table += `</tr>`;
        }
        table += `</table>`;
    } catch (err) {
        console.log(err);
        table = "Cannot connect to DB";
    }
    return table;
}

module.exports = display_admin_page;
