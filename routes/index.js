'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const soap = require('strong-soap').soap;

const wsUrl = "https://app.corposistemasgt.com/webservicefronttest/factwsfront.asmx?WSDL";
const requestor = "8A454E3F-CEA1-41D8-A13A-A748A4891BBF";
const soapParams = {
	Requestor:	requestor,
	UserName:	"TEST", // Usuario para certificar el documento
	Country:	"GT",
	User:		requestor
};

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/soap', function(req, res, next) {
	const xmlFileToSend = './xml/800000001026_FACT98D24E77D6644C44.xml';

	fs.readFile(xmlFileToSend, 'utf8', function(err, data) {
		if (err) throw err;
				
		const xmlBase64 = Buffer.from(data, 'utf8').toString('base64');
		const idInterno = Date.now();
		const nitEmisor = "800000001026";

		soapPOST_DOCUMENT_SAT(wsUrl, xmlBase64, idInterno, nitEmisor)
			.then(resp => res.json(resp))
			.catch(err => res.json(err));
	});
});

function soapPOST_DOCUMENT_SAT(wsUrl, xmlBase64, idInterno, nitEmisor) {
	// Data1: MÉTODO A UTILIZAR
	const data1 = "POST_DOCUMENT_SAT";
	
	// Data2: FACTURA EN XML -> BASE 64
	const data2 = xmlBase64;
	
	// Data3: ID INTERNO
	const data3 = idInterno;
	
	// Call SOAP

	return new Promise((resolve, reject) => {
		const options = {};
		soap.createClient(wsUrl, options, function(err, client) {
			if (err) {
				rejects(err);
			}

			const method = client['RequestTransaction'];
			const requestArgs = {
				...soapParams,
				'Transaction':	"SYSTEM_REQUEST",
				'Entity':		nitEmisor,
				'Data1':		data1,
				'Data2':		data2,
				'Data3':		data3
			};

			method(requestArgs, function(err, result, envelope, soapHeader) {
				// console.log('result ', result);
				// console.log('envelope ', envelope);

				if (err) {
					reject(err);
				}

				const wsResponse = result['RequestTransactionResult']['Response'];
				
				if(['Result'] == false) {
					reject(wsResponse);
				} else {
					resolve(wsResponse);
				}	
			});
		});
	});

}

module.exports = router;
