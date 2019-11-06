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

// connection.connect(function(err) {
//     if (err) {
//         console.error("error connecting: " + err.stack);
//         return;
//     }
//     console.log("connected as id " + connection.threadId);
// });

var newEmployeeQuestions = [
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
        name: 'role',
        message: "Select employee's role:",
        choices: roleList
    },
    {   
        type: 'list',
        name: 'department',
        message: "Select employee's department:",
        choices: departmentList
    },
    {   
        type: 'list',
        name: 'manager',
        message: "Select employee's manager:",
        choices: managerList
    }
];

async function startProgram(){
    let answers = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View employees by manager',
            'View employees by department',
            'Add new employee',
            'Remove employee',
            'Update employee role',
            'Update employee manager',
        ]
    });
    switch(answers.action) {
        case 'View all employees': viewAllEmployees()
            break;
        case 'View employees by manager': 
            break;
        case 'View employees by department': 
            break;
        case 'Add new employee': addNewEmployee()
            break;
        case 'View employees by department': 
            break;
        case 'View employees by department': 
            break;
        case 'View employees by department': 
            break;

        default:
          // code block
    }
}

startProgram();

async function viewAllEmployees(){ 
    db.query("SELECT * FROM employee", function(err, res) {
        console.table(res); 
        startProgram();
    });
}

async function addNewEmployee() {
    //Build manager list
    let res1 = await db.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NOT NULL")
    for (x = 0; x <= res1.length-1; x++){
        managerList[x] = `${res1[x].first_name} ${res1[x].last_name}`
    }
    //Build department list
    let res2 = await db.query("SELECT name FROM departments")
    for (department of res2) {departmentList.push(department.name)}
    //Build role list
    let res3 = await db.query("SELECT title FROM roles")
    for (role of res3) {roleList.push(role.title)}

    let answer = await inquirer.prompt(newEmployeeQuestions)
    roleID = await IDconversion("roles","title",answer.role)
    managerID = 1
    db.query("INSERT INTO company.employee SET ?",
    {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: roleID[0].id,
        manager_id: managerID
    })
}

function IDconversion(table,column,value) {
    return db.query(`SELECT id FROM ${table} WHERE ${column}="${value}"`)
}
