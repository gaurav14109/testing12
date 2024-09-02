// const ldapUrl = 'ldap://192.168.98.214'
// const { authenticate } = require('ldap-authentication');

const users = [
  {
    displayName: "Gaurav Gusain",
    pf_no: "ACOEACC13769365",
    email: "gaurav@gmail.com",
    employee_name: "Gaurav Gusain",
  },
  {
    displayName: "Sachin Gusain",
    pf_no: "ACOEACC13722923",
    email: "Sachin@gmail.com",
    employee_name: "Sachin Gusain",
  },
  {
    displayName: "Abhishek Gusain",
    pf_no: "ACOEACC13769364",
    email: "Abhishek@gmail.com",
    employee_name: "Abhishek Gusain",
  },
  {
    displayName: "Ashwin Gusain",
    pf_no: "ACOEACC13769369",
    email: "Ashwin@gmail.com",
    employee_name: "Ashwin Gusain",
  },
  {
    displayName: "Ronak Gusain",
    pf_no: "ACOEACC13769361",
    email: "Ronak@gmail.com",
    employee_name: "Ronak Gusain",
  },
  {
    displayName: "Anas Gusain",
    pf_no: "ACOEACC13769368",
    email: "Anas@gmail.com",
    employee_name: "Anas Gusain",
  },
];
const ldapFindUser = async (pfNo) => {
  try {
    // const options = {
    //   ldapOpts: {
    //     url: ldapUrl,
    //   },
    //   adminDn: "edlgapdev@ubimarigold.in",
    //   adminPassword: "Thursday@0724",
    //   verifyUserExists: true,
    //   userSearchBase: "dc=ubimarigold,dc=in",
    //   usernameAttribute: "sAMAccountName",
    //   username: `${pfNo.toUpperCase()}`,
    // };
    // let authenticated = await authenticate(options)
    console.log(pfNo.toUpperCase())
    const authenticated = users.filter((user)=>{
        return user.pf_no === pfNo.toUpperCase()
    })
    
    if(authenticated.length > 0){
    return authenticated
}else{
    return [];
}
  } catch (error) {
    
    return [];
  }
};

module.exports = { ldapFindUser };
