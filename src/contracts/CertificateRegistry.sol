// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateRegistry {
    struct Certificate {
        string hash;
        address issuer;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => Certificate) private certificates;
    mapping(address => bool) public authorizedIssuers;
    address public owner;
    
    event CertificateRegistered(
        string indexed hash,
        address indexed issuer,
        uint256 timestamp
    );
    
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    function registerCertificate(string memory _hash) 
        external 
        onlyAuthorizedIssuer 
        returns (bool) 
    {
        require(!certificates[_hash].exists, "Certificate already registered");
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        
        certificates[_hash] = Certificate({
            hash: _hash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit CertificateRegistered(_hash, msg.sender, block.timestamp);
        return true;
    }
    
    function verifyCertificate(string memory _hash) 
        external 
        view 
        returns (bool exists, address issuer, uint256 timestamp) 
    {
        Certificate memory cert = certificates[_hash];
        return (cert.exists, cert.issuer, cert.timestamp);
    }
    
    function authorizeIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid address");
        require(!authorizedIssuers[_issuer], "Already authorized");
        
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }
    
    function revokeIssuer(address _issuer) external onlyOwner {
        require(_issuer != owner, "Cannot revoke owner");
        require(authorizedIssuers[_issuer], "Not an authorized issuer");
        
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        require(_newOwner != owner, "Already the owner");
        
        authorizedIssuers[owner] = false;
        owner = _newOwner;
        authorizedIssuers[_newOwner] = true;
    }
}