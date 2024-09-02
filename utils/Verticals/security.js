const fileHandler = require('../fileHandler/fileHandler');
// const convertJsonSchemaToParquet = require('../parquetSchema')
const fileHandlerInstance = new fileHandler()
class Security {

    async smr2BranchSaveToFLatFiles(data){
        const {guardDetails,...branchDetails} = data
        // const branchScehma = convertJsonSchemaToParquet(branchDetails)
        // const guardSchema =  convertJsonSchemaToParquet(guardDetails[0])
        //Get sequence and add to json with edit is click get all data for the json and update.
        const { qtr, year, ...rest } = branchDetails;
        //check filecount and other things as well
        //add requests activity logs user details file count......
        let path = `/ENCRYPTED_LDZ/FLATFILES/GAP/Security/SMR2Branch/${year}/${qtr}/${rest.QEnd_date}`;
        await fileHandlerInstance.moveJsonToFlatFiles(branchDetails,path,'smr2branch.json')
        await fileHandlerInstance.moveJsonToFlatFiles(guardDetails,path,'smr2Guard.json')
        return
    }
}

module.exports = Security;
