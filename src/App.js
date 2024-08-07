import React, { useState } from 'react';
import JSZip from 'jszip';
import dicomParser from 'dicom-parser';
import './styles.css'; // Asegúrate de que este archivo existe y tiene el contenido adecuado
import './App.css'; // Asegúrate de que este archivo existe y tiene el contenido adecuado

const App = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [donateButtonDisabled, setDonateButtonDisabled] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [messageClass, setMessageClass] = useState('');

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();

        let allValid = true;
        const validationPromises = files.map(file => validateFile(file).then(isValid => {
            if (isValid) {
                const newRow = {
                    name: file.name,
                    category: document.getElementById('category-select').value,
                    date: formattedDate,
                    time: formattedTime
                };
                setHistorial(prevHistorial => [...prevHistorial, newRow]);
            } else {
                allValid = false;
                setResultMessage(`El archivo "${file.name}" no contiene imágenes DICOM válidas.`);
                setMessageClass('text-danger');
                setTimeout(() => {
                    setResultMessage('');
                }, 5000);
            }
            return isValid;
        }));

        await Promise.all(validationPromises);
        setDonateButtonDisabled(!allValid);
        if (allValid) {
            setResultMessage('Archivos subidos con éxito.');
            setMessageClass('text-success');
            setTimeout(() => {
                setResultMessage('');
            }, 5000);
        }
    };

    const deleteRow = (fileName) => {
        setHistorial(prevHistorial => prevHistorial.filter(file => file.name !== fileName));
        setResultMessage(`Archivo "${fileName}" ha sido eliminado.`);
        setMessageClass('text-danger');
        setTimeout(() => {
            setResultMessage('');
        }, 5000);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (historial.length > 0) {
            const fileNames = historial.map(file => file.name).join(', ');
            setResultMessage(`Archivos "${fileNames}" subidos con éxito.`);
            setMessageClass('text-success');
            document.getElementById('donationForm').reset();
            setHistorial([]);
            setDonateButtonDisabled(true);
            setTimeout(() => {
                setResultMessage('');
            }, 5000);
        } else {
            setResultMessage('Por favor, selecciona uno o más archivos.');
            setMessageClass('text-danger');
            setTimeout(() => {
                setResultMessage('');
            }, 5000);
        }
    };

    const validateFile = async (file) => {
        const fileNameLower = file.name.toLowerCase();
        const fileExtension = fileNameLower.slice(fileNameLower.lastIndexOf('.'));

        if (fileExtension === '.dcm' || fileExtension === '.dicom') {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = function (event) {
                    try {
                        const byteArray = new Uint8Array(event.target.result);
                        dicomParser.parseDicom(byteArray);
                        resolve(true);
                    } catch (e) {
                        resolve(true);  // Aceptamos todos los archivos con extensión .dcm o .dicom
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        } else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
            const jszip = new JSZip();
            const zip = await jszip.loadAsync(file);
            let containsDicom = false;
            await Promise.all(Object.keys(zip.files).map(async filename => {
                if (filename.toLowerCase().endsWith('.dcm') || filename.toLowerCase().endsWith('.dicom')) {
                    containsDicom = true;
                }
            }));
            return containsDicom;
        } else {
            return false;
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-5 mb-4 main-container">
                    <h1 className="h1">Donación de Estudios Médicos</h1>
                    <p>Por favor, sube tus archivos de estudios médicos para donación. Tu aporte puede ayudar a salvar vidas.</p>
                    <form id="donationForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="category-select" className="label-text">Seleccione una Categoría</label>
                            <select className="form-control" id="category-select" name="category">
                                <option value="Radiografía">Radiografía</option>
                                <option value="Resonancia Magnética">Resonancia Magnética</option>
                                <option value="Tomografía Computarizada">Tomografía Computarizada</option>
                                <option value="Ultrasonido">Ultrasonido</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="file-input" className="label-text">Estudio Médico (DICOM, DCM o ZIP)</label>
                            <label className="Documents-btn" htmlFor="file-input">
                                <span className="folderContainer">
                                    <svg className="fileBack" width="146" height="113" viewBox="0 0 146 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 4C0 1.79086 1.79086 0 4 0H50.3802C51.8285 0 53.2056 0.627965 54.1553 1.72142L64.3303 13.4371C65.2799 14.5306 66.657 15.1585 68.1053 15.1585H141.509C143.718 15.1585 145.509 16.9494 145.509 19.1585V109C145.509 111.209 143.718 113 141.509 113H3.99999C1.79085 113 0 111.209 0 109V4Z" fill="url(#paint0_linear_117_4)"></path>
                                        <defs>
                                            <linearGradient id="paint0_linear_117_4" x1="0" y1="0" x2="72.93" y2="95.4804" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#26798E"></stop>
                                                <stop offset="1" stopColor="#26798E"></stop>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <svg className="filePage" width="88" height="99" viewBox="0 0 88 99" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="88" height="99" fill="url(#paint0_linear_117_6)"></rect>
                                    </svg>
                                    <svg className="fileFront" width="160" height="79" viewBox="0 0 160 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.29306 12.2478C0.133905 9.38186 2.41499 6.97059 5.28537 6.97059H30.419H58.1902C59.5751 6.97059 60.9288 6.55982 62.0802 5.79025L68.977 1.18034C70.1283 0.410771 71.482 0 72.8669 0H77H155.462C157.87 0 159.733 2.1129 159.43 4.50232L150.443 75.5023C150.19 77.5013 148.489 79 146.474 79H7.78403C5.66106 79 3.9079 77.3415 3.79019 75.2218L0.29306 12.2478Z" fill="url(#paint0_linear_117_5)"></path>
                                        <defs>
                                            <linearGradient id="paint0_linear_117_5" x1="38.7619" y1="8.71323" x2="66.9106" y2="82.8317" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#26798E"></stop>
                                                <stop offset="1" stopColor="#26798E"></stop>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                                <p className="text1">Subir documentos</p>
                            </label>
                            <input type="file" className="form-control-file" id="file-input" name="file" accept=".dcm,.dicom,application/dicom,application/octet-stream,image/dicom,application/x-dicom,application/dicom+zip,application/zip" multiple required style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                        <button type="submit" id="donate-button" className="btn-donate" disabled={donateButtonDisabled}>
                            DONAR <i className="fas fa-heart btn-icon"></i>
                        </button>
                    </form>
                    <div id="result" className={`text-center mt-3 ${messageClass}`}>{resultMessage}</div>
                </div>
                <div className="col-md-5 history-container">
                    <h3>Historial de Archivos Subidos</h3>
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Nombre del Archivo</th>
                                    <th>Categoría</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cancelar</th>
                                </tr>
                            </thead>
                            <tbody id="historial-body">
                                {historial.map(file => (
                                    <tr key={file.name}>
                                        <td>{file.name}</td>
                                        <td>{file.category}</td>
                                        <td>{file.date}</td>
                                        <td>{file.time}</td>
                                        <td>
                                            <button className="bin-button btn btn-danger" onClick={() => deleteRow(file.name)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
