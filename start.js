const mysql = require('mysql')
const inquirer = require('inquirer')
const consoleTable = require('console.table')

// make json dependancies file via NPM INIT

var managerList = []
var roleList = []
var departmentList = []

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "company"
});

async function startProgram(){
    let answers = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all departments',
            'View all roles',
            'Add employee',
            'Add department',
            'Add role',
            'Remove employee',
            'Remove department',
            'Remove role',
            'Update employee role'
        ]
    });
    switch(answers.action) {
        case 'View all employees': viewAllEmployees()
            break;
        case 'View all departments': viewAllDepartments()
            break;
        case 'View all roles': viewAllRoles()
            break;
        case 'Add employee': addEmployee()
            break;
        case 'Remove employee': removeEmployee() 
            break;
        case 'Add department': addDepartment()
            break;
        case 'Remove department': removeDepartment()
            break;
        case 'Add role': addRole()
            break;
        case 'Remove role': removeRole()
            break;
        case 'Update employee role': updateRole()
            break;
        default:
    }
}

startProgram();

async function viewAllEmployees(){ 
    db.query("SELECT * FROM employee", function(err, res) {
        console.table(res); 
        startProgram();
    });
}

async function viewAllDepartments(){ 
    db.query("SELECT * FROM departments", function(err, res) {
        console.table(res); 
        startProgram();
    });
}

async function viewAllRoles(){ 
    db.query("SELECT * FROM roles", function(err, res) {
        console.table(res); 
        startProgram();
    });
}

async function addEmployee() {
    //Build manager list
    let res = await db.query("SELECT employee.id, first_name, last_name FROM employee WHERE manager_id IS NOT NULL");
    for (x = 0; x <= res.length-1; x++){
        managerList[x] = `${res[x].first_name} ${res[x].last_name}`
    };

    //Build department list
    departmentList = await buildList("departments","name");

    let answer = await inquirer.prompt([ 
        {   
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
        },
        {   
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
        },
        {   
            type: 'list',
            name: 'department',
            message: "Select employee's department:",
            choices: departmentList
        }
    ]);

    //Build role list
    departmentID = await convertToID("departments","name",answer.department);
    roleList = await buildList("roles","title","department_id",departmentID[0].id);
    managerList = await buildNameList(false,departmentID[0].id);
    managerList.push("No manager");

    let answer2 = await inquirer.prompt([
        {   
            type: 'list',
            name: 'role',
            message: "Select employee's role:",
            choices: roleList
        },
        {   
            type: 'list',
            name: 'manager',
            message: "Select employee's manager:",
            choices: managerList
        }
    ]);
    roleID = await convertToID("roles","title",answer2.role);
    if (answer2.manager == "No manager") {managerID = "NULL"}
    else {
        let firstname = answer2.manager.split(" ")[0];
        let lastname = answer2.manager.split(" ")[1];
        managerID = await convertToID("employee","first_name",firstname,"last_name",lastname)
    }
    console.log(answer, managerID[0].id)
    db.query("INSERT INTO company.employee SET ?",
    {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: roleID[0].id,
        manager_id: managerID[0].id,
        department_id: departmentID[0].id
    });
    startProgram();
}

async function addDepartment() {
    let answer = await inquirer.prompt({    
        type: 'input',
        name: 'department',
        message: 'Department name:'}
    );
    db.query(`INSERT INTO departments (name) VALUES ("${answer.department}")`);
    console.log(`${answer.department} successfully added.`);
    startProgram();
}

async function addRole() {
    //Build department list
    departmentList = await buildList("departments","name");

    let answer = await inquirer.prompt([    
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Role title:'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Role salary:'
        },
        {   
            type: 'list',
            name: 'department',
            message: "Select department for which role is intended:",
            choices: departmentList
        }]);

    let departmentID = await convertToID("departments","name",answer.department)

    db.query(`INSERT INTO roles SET ?`,
    {
        title: answer.roleTitle,
        salary: answer.roleSalary,
        department_id: departmentID[0].id,
    });
    console.log(`${answer.roleTitle} successfully added.`);
    startProgram();
}

async function removeEmployee() {
    employeeList = await buildNameList(false);
    let answer = await inquirer.prompt({   
        type: 'list',
        name: 'employeeRemove',
        message: "Select employee to remove:",
        choices: employeeList
    });
    let firstname = answer.employeeRemove.split(" ")[0];
    let lastname = answer.employeeRemove.split(" ")[1];
    let confirmEmployee = await db.query(`SELECT employee.id, employee.first_name, employee.last_name, roles.title, roles.salary, departments.name \n
    FROM employee \n
    LEFT JOIN roles on roles.id = employee.role_ID \n
    LEFT JOIN departments on departments.id = roles.department_id \n
    WHERE employee.first_name = "${firstname}" AND employee.last_name = "${lastname}"`);
    console.table(confirmEmployee)
    let confirmAnswer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmRemove',
        message: `Confirm delete of ${firstname} ${lastname}.`
    });
    if (confirmAnswer.confirmRemove == true){
        await db.query(`DELETE FROM employee WHERE id = ${confirmEmployee[0].id}`);
        console.log(`${firstname} ${lastname} successfuly deleted from databse`);
    }
    startProgram();
}

async function removeDepartment() {
    departmentsList = await buildList("departments","name");
    let answer = await inquirer.prompt({   
        type: 'list',
        name: 'departmentRemove',
        message: "Select department to remove:",
        choices: departmentsList
    });

    let confirmDepartment = await db.query(`SELECT id, name \n
    FROM departments \m
    WHERE name = "${answer.departmentRemove}"`);
    console.table(confirmDepartment)
    let confirmAnswer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmRemove',
        message: `Confirm delete of ${answer.departmentRemove}.`
    });
    if (confirmAnswer.confirmRemove == true){
        await db.query(`DELETE FROM departments WHERE id = ${confirmDepartment[0].id}`);
        console.log(`${answer.departmentRemove} successfuly deleted from databse`);
    }
    startProgram();
}

async function removeRole() {
    roleList = await buildList("roles","title");
    let answer = await inquirer.prompt({   
        type: 'list',
        name: 'roleRemove',
        message: "Select role to remove:",
        choices: roleList
    });

    let confirmRole = await db.query(`SELECT id, title, salary, department_id \n
    FROM roles \m
    WHERE title = "${answer.roleRemove}"`);
    console.table(confirmRole)
    let confirmAnswer = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmRemove',
        message: `Confirm delete of ${answer.roleRemove}.`
    });
    if (confirmAnswer.confirmRemove == true){
        await db.query(`DELETE FROM roles WHERE id = ${confirmRole[0].id}`);
        console.log(`${answer.roleRemove} successfuly deleted from databse`);
    }
    startProgram();
}

async function updateRole(){
    employeeList = await buildNameList(false);
    let answer = await inquirer.prompt({   
        type: 'list',
        name: 'employeeUpdate',
        message: "Select employee to update:",
        choices: employeeList
    });
    let firstname = answer.employeeUpdate.split(" ")[0];
    let lastname = answer.employeeUpdate.split(" ")[1];
    let currentRole = db.query(`SELECT title FROM roles WHERE id = (SELECT )`)
    console.log(`${firstname} ${lastname}'s current role is: ${currentRole}. Select a role to update to:`)
    let roleList = await buildList("roles","title")
    let answer2 = await inquirer.prompt({   
        type: 'list',
        name: 'roleChoice',
        choices: roleList
    });
    startProgram();    
}

function convertToID(table,inputColumn,inputValue,inputColumn2,inputValue2) {
    if (inputColumn2 == null && inputValue2 == null) {where2 = ""}
    else {where2 = ` AND ${inputColumn2}="${inputValue2}"`};
    return db.query(`SELECT id FROM ${table} WHERE ${inputColumn}="${inputValue}"${where2}`);
}

async function buildNameList(managerConstraint,department_id) {
    let list = [];
    var where;

    if (managerConstraint == true && department_id !== null) {
        where = ` WHERE manager_id IS NULL AND department_id = ${department_id}`
    }
    else if (managerConstraint == true) {where = " WHERE manager_id IS NULL"}
    else if (department_id !== undefined) {where = ` WHERE department_id = ${department_id}`}
    else {where = ""}
    let res = await db.query(`SELECT first_name, last_name FROM employee${where}`);
    for (x = 0; x <= res.length-1; x++){
        list[x] = `${res[x].first_name} ${res[x].last_name}`
    };
    return list;
}

async function buildList(table,column,whereColumn,whereValue) {
    let list = [];
    var where;
    if (whereColumn == null && whereValue == null) {where = ""}
    else {where = ` WHERE ${whereColumn}="${whereValue}"`};
    let res = await db.query(`SELECT ${column} FROM ${table}${where}`);
    for (item of res) {list.push(item[Object.keys(item)[0]])};
    return list;
};