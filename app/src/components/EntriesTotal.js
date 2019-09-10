import React from 'react';
import { ContractData } from "drizzle-react-components";
import { Segment } from 'semantic-ui-react'

const EntriesTotal = () => (
  <Segment>
    EntriesTotal: <ContractData contract="Logic" method="count" />
  </Segment>
);

export default EntriesTotal;