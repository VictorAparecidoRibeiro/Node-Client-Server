class UserController{

    constructor(formIdCreate, formIdUpdate,  tableId){
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.formEl = document.getElementById(formIdCreate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEditCancel();
        this.onEdit();
        this.selectAll();
       
      
    }

    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener("submit", event =>{
            event.preventDefault();
            
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disable = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);


        
    this.getPhoto(this.formUpdateEl).then(
                
        (content)=>{

            if(!values.photo) {
                result._photo = userOld._photo;
            }else{
                result._photo = content;
            }

            let user = new User();
            user.loadFromJSON(result);

            user.save().then(user=>{
                this.getTr(user, tr);
           
        
                this.addEventsTr(tr);
        
                this.updateCount();
    
                this.formUpdateEl.reset();
    
                btn.disable = false;
    
                this.showPanelCreate();
            });

           

        }, 
        (e)=>{
            console.error(e);

        }
    );


        });


    }

    onEditCancel(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });
    }

    showPanelCreate(){
        
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate(){
        
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }

    onSubmit(){

        

        this.formEl.addEventListener("submit", event =>{

            //Não atualiza a pagina
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");
            btn.disable = true;

            let values = this.getValues(this.formEl);

            console.log(values);

            if(!values) return false;

            this.getPhoto(this.formEl).then(
                
                (content)=>{
                    values.photo = content;


                    values.save().then(user=>{
                        this.addLine(user);

                        this.formEl.reset();
    
                        btn.disable = false;
    
                    });
                   
                }, 
                (e)=>{
                    console.error(e);

                }
            );

    
        });
    }

    getPhoto(form){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...form.elements].filter(item =>{
    
                if(item.name === 'photo'){
                    return item;
                }
                
            });
    
            let file = elements[0].files[0];
    
            fileReader.onload = ()=>{
               
    
                resolve(fileReader.result);
            };

            fileReader.onerror = (e)=>{
                reject(e);
            };
    
            if(file){
                fileReader.readAsDataURL(file);
            }else{
                resolve('dist/img/boxed-bg.jpg');
            }
           

        });

     
    }

    getValues(formEl){

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach((field, index) =>{
            
            //Validação para campos obrigatórios
            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){

                
                field.parentElement.classList.add(['has-error']);
                isValid = false;

            }

            if(field.name == "gender"){
                
                if(field.checked){
                    user[field.name] = field.value;
                }
        
            }else if(field.name == "admin"){
                
                user[field.name] = field.checked;
            }else{
                user[field.name] = field.value;
            }
        
        });

        
        if(!isValid){
            return false;
        }

        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email,
            user.password,
            user.photo, 
            user.admin);

       

    }



    addLine(dataUser){

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);
    
        this.updateCount();
          
    }

    getTr(dataUser, tr = null){

        if(tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML  = ` 
          
        <td>
            <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm">
        </td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
        <td>${Utils.dateFormat(dataUser.register)}</td>
        <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
        </td>
    `;

    this.addEventsTr(tr);

    return tr;

    }

    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e=>{

            if(confirm("Deseja realmente excluir o registro?")){

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove().then(data=>{

                    tr.remove();

                    this.updateCount();
                });

               
            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e=>{


            let json = JSON.parse(tr.dataset.user);
            //let form =  document.querySelector("#form-user-update");

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            for (let name in json){
               
                let field = this.formUpdateEl.querySelector("[name = "+ name.replace("_", "") +"]");

                

                if(field){
                   
                    switch (field.type){
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name = "+ name.replace("_", "") +"][value = "+json[name]+"]");
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                            break;
                    }
                   
                }

                
            }

            console.log(json);
            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();

        });
    }

    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if(user._admin){
                numberAdmin++;
            }

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }


    selectAll(){
       
       
        User.getUsersStorage().then(data=>{
            
            data.users.forEach(dataUser =>{
 
                let user = new User();
        
                user.loadFromJSON(dataUser);
        
        
                console.log("Passou", user);
                this.addLine(user);
               });
        });

    

    
     }
}