import React from 'react';
import { ContractData } from "drizzle-react-components";
import { Item } from 'semantic-ui-react';
import { ethToJs } from '../utils'

const renderProps = (displayData) => {
  var i = 0;
  const displayObjectProps = [];

  Object.keys(displayData).forEach(key => {
    if (i != key) {
      displayObjectProps.push(
        <p key={i}>
          {key}: {`${displayData[key]}`}
        </p>
      );
    }

    i++;
  });

  const jsData = ethToJs(displayData.keys, displayData.values, displayData.offsets);

  return <div>
    {displayObjectProps}
    {JSON.stringify(jsData)}
  </div>
};

const Entry = (props) => (
  <Item>
    <Item.Content>
      <Item.Header>Entry key: {props.data}</Item.Header>
      <Item.Description>
        <ContractData contract="Logic" method="get" methodArgs={[props.data]} render={renderProps}/>
      </Item.Description>
    </Item.Content>
  </Item>
);

export default Entry;