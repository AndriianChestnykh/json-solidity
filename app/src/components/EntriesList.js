import React from 'react';
import Entry from "./Entry";
import { ContractData } from "drizzle-react-components";
import { Item } from 'semantic-ui-react'

function renderProps(displayData) {
  return displayData.map((key, index) => (<Entry key={index} data={key}/>));
}

const EntriesList = () => (
  <Item.Group>
    <ContractData contract="Logic" method="getAllIds" render={renderProps}/>
  </Item.Group>
);

export default EntriesList;
