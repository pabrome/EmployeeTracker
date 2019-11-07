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
        case 'Remove employee': removeEmployee() 
            break;
        case 'Update employee role': 
            break;
        case 'Update employee manager': 
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
    let res1 = await db.query("SELECT employee.id, first_name, last_name FROM employee WHERE manager_id IS NOT NULL");
    for (x = 0; x <= res1.length-1; x++){
        managerList[x] = `${res1[x].first_name} ${res1[x].last_name}`
    };

    //Build department list
    departmentList = await buildList("name","departments");

    //Build role list
    roleList = await buildList("title","roles");

    let answer = await inquirer.prompt(newEmployeeQuestions);
    roleID = await convertToID("roles","title",answer.role);
    managerID = 1
    db.query("INSERT INTO company.employee SET ?",
    {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: roleID[0].id,
        manager_id: managerID
    });
}

async function removeEmployee() {
    employeeList = await buildNameList(false);
    console.log(employeeList);
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



function convertToID(table,column,value,column2,value2) {
    if (column2 && value2 == undefined) {where2 = ""}
    else{where2 = ` AND ${column2}="${value2}"`};
    return db.query(`SELECT id FROM ${table} WHERE ${column}="${value}"${where2}`);
}

async function buildNameList(constraint) {
    let list = []
    var where
    if (constraint == true) {where = " WHERE manager_id IS NOT NULL"}
    else{where = ""}
    let res = await db.query(`SELECT first_name, last_name FROM employee${where}`)
    for (x = 0; x <= res.length-1; x++){
        list[x] = `${res[x].first_name} ${res[x].last_name}`
    }
    return list
}

async function buildList(column,table) {
    let list = []
    let res = await db.query(`SELECT ${column} FROM ${table}`)
    for (item of res) {list.push(item[Object.keys(item)[0]])}
    return list
}