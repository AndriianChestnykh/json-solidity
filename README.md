# Solidity JSON data storage

## Abstract 
This repository contains Solidity and JavaScript libraries which enables storage and processing of JSON-like data structures on chain. It can be used as universal data storage for many use cases.

## Features
- [x] **Support JSON parsing and storage**  
Smart contracts can store JSON objects with a set of name/value pairs of arbitrary pairs quantity and values length. Values can be only strings at the moment.

- [x] **On chain access to data structure**  
Smart contracts have access to data parts based on its structure

- [x] **Security and versioning with per-entry granularity**  
Each JSON entry in Storage contract is bound to its specific Logic Smart Sontract or account address with exclusive permissions to modify the entry or switch ot other Logic address

## Roadmap
- [ ] More data types for values, including nested objects and arrays.
