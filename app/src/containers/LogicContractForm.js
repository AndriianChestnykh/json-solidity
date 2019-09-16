/* Modified ContractFrom class */

import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { jsToEth } from '../utils'
import { Form } from 'semantic-ui-react'

/*
 * Create component.
 */

class LogicContractForm extends Component {
    constructor(props, context) {
        super(props);

        console.log('LogicContractForm props: ', props);
        console.log('LogicContractForm context: ', context);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.accounts = props.accounts;
        this.contracts = context.drizzle.contracts;
        // do not need web3 object for now
        // this.web3 = context.drizzle.web3;

        this.state = {
            key: '0x0000000000000000000000000000000000000000000000000000000000000001',
            data: '{"key1": "value1", "key2": "value2"}',
            // owner: this.accounts['0']
        };
    }

    handleInputChange(event) {
      //todo not sure if this should be in state just to service handleInputChange
        this.setState({ [event.target.name]: event.target.value })
    }

    handleSubmit(event) {
        let data;
        try {
            data = jsToEth(JSON.parse(this.state.data));
            console.log('jsToEth: ', data);
            this.contracts[this.props.contract].methods[this.props.method].cacheSend(this.state.key, data.keys, data.values, data.offsets/*, this.state.owner*/);
        } catch(e) {
            alert(e.message)
        }
    }

    render() {
        return (
            <Form>
                <Form.TextArea label="Entity key" key="key" type="text" name="key" defaultValue={this.state.key} placeholder="key" onChange={this.handleInputChange}/><br/>
                <Form.TextArea label="Entity data: JSON-like key-value data" key="data" type="text" name="data" defaultValue={this.state.data} placeholder="data" onChange={this.handleInputChange}/><br/>
                {/*<Form.TextArea label="Entity owner" key="owner" type="text" name="owner" defaultValue={this.state.owner} placeholder="owner" onChange={this.handleInputChange}/><br/>*/}
                <Form.Button key="submit" className="pure-button" type="button" onClick={this.handleSubmit}>Submit</Form.Button>
            </Form>
        )
    }
}

LogicContractForm.contextTypes = {
    drizzle: PropTypes.object
};

const mapStateToProps = state => {
    return {
        accounts: state.accounts,
    }
};

export default drizzleConnect(LogicContractForm, mapStateToProps)
