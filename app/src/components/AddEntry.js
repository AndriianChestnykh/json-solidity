import { drizzleConnect } from 'drizzle-react'
import React from "react";
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
import LogicContractFrom from '../containers/LogicContractForm'
import { Card } from 'semantic-ui-react'

const AddEntry = () => (
  <Card>
    {/*<ToastContainer />*/}
    <Card.Content>
      <Card.Header>Add Entry to Smart Contract</Card.Header>
      <div>
        <LogicContractFrom contract="Logic" method="set"/>
      </div>
    </Card.Content>
  </Card>
);

export default AddEntry;