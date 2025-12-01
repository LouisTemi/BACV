// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.10;

contract Azcredify {
            
    struct Certificate {
        string documentHash;                
        string studentName;
        string issuerID;
        string course;
        string certificateType;
        string yearOfGraduation;
        bool isRevoked;
        uint256 revokedAt;
        string revocationReason;
    } 
    
    mapping(string => Certificate) certificates; //linking studentId and Certificate    
    string[] public listOfStudentIDs; //array of studentIDs

    event CertificateInfo(
        string documentHash,
        string studentName,
        string issuerID,
        string course,
        string certificateType,
        string yearOfGraduation
    );

    event CertificateRevoked(
        string studentId,
        string reason,
        uint256 revokedAt
    );

    function setCertificate(
        string memory _studentId, 
        string memory _documentHash, 
        string memory _studentName, 
        string memory _issuerID,
        string memory _course,
        string memory _certificateType,
        string memory _yearOfGraduation
    ) external {        
        certificates[_studentId] = Certificate({
            documentHash: _documentHash,            
            studentName: _studentName, 
            issuerID: _issuerID,
            course: _course,
            certificateType: _certificateType,
            yearOfGraduation: _yearOfGraduation,
            isRevoked: false,
            revokedAt: 0,
            revocationReason: ""
        });

        emit CertificateInfo(_documentHash, _studentName, _issuerID, _course, _certificateType, _yearOfGraduation);
        
        listOfStudentIDs.push(_studentId);      
    }

    function revokeCertificate(string memory _studentId, string memory _reason) external {
        require(bytes(certificates[_studentId].documentHash).length > 0, "Certificate does not exist");
        require(!certificates[_studentId].isRevoked, "Certificate is already revoked");
        
        certificates[_studentId].isRevoked = true;
        certificates[_studentId].revokedAt = block.timestamp;
        certificates[_studentId].revocationReason = _reason;

        emit CertificateRevoked(_studentId, _reason, block.timestamp);
    }

    function getCertificateStatus(string memory _studentId) public view returns (bool isRevoked, uint256 revokedAt, string memory reason) {
        return (
            certificates[_studentId].isRevoked,
            certificates[_studentId].revokedAt,
            certificates[_studentId].revocationReason
        );
    }

    function getStudentIDs() view public returns(string[] memory) {
        return listOfStudentIDs;
    }
    
    function getCertificateInfo(string memory _studentId) public view returns (
        string memory, 
        string memory, 
        string memory
    ) {
        return (
            certificates[_studentId].documentHash,
            certificates[_studentId].studentName,
            certificates[_studentId].issuerID
        );
    }

    function getFullCertificateInfo(string memory _studentId) public view returns (
        string memory documentHash,
        string memory studentName,
        string memory issuerID,
        string memory course,
        string memory certificateType,
        string memory yearOfGraduation,
        bool isRevoked,
        uint256 revokedAt,
        string memory revocationReason
    ) {
        Certificate memory cert = certificates[_studentId];
        return (
            cert.documentHash,
            cert.studentName,
            cert.issuerID,
            cert.course,
            cert.certificateType,
            cert.yearOfGraduation,
            cert.isRevoked,
            cert.revokedAt,
            cert.revocationReason
        );
    }
}