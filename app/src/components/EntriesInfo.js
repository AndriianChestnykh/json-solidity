import React from 'react';
import EntriesList from './EntriesList';
import EntriesTotal from './EntriesTotal';

const EntriesInfo = () => (
    <span>
        <h2>Entries info from Smart Contract</h2>
        <EntriesTotal/>
        <EntriesList/>
    </span>
);

export default EntriesInfo;
