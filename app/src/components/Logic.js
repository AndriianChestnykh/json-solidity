import React from 'react';
import EntriesInfoContainer from './EntriesInfo';
import AddEntry from './AddEntry'
import { Card } from 'semantic-ui-react';

const Logic = () => (
  <Card.Group>
    <AddEntry/>
    <EntriesInfoContainer/>
  </Card.Group>
);

export default Logic;