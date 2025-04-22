import React, { useState, useRef } from 'react';
import { uploadResume, saveResume, ResumeParseResponse } from '../../services/resumeService/resumeService';

interface ResumeUploadFormProps {
  onResumeDataLoaded: (data: ResumeParseResponse) => void;
  onError: (error: string) => void;
}

const ResumeUploadForm: React.FC<ResumeUploadFormProps> = ({ onResumeDataLoaded, onError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage('File size should be less than 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        setErrorMessage('Please upload a PDF or Word document');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAndParse = async () => {
    if (!file) {
      setErrorMessage('Please select a resume file to upload');
      return;
    }

    try {
      setIsUploading(true);
      const parsedData = await uploadResume(file);
      setIsUploading(false);

      // Save the parsed data
      // setIsSaving(true);
      // await saveResume(file.name, parsedData);
      // setIsSaving(false);

      onResumeDataLoaded(parsedData);
    } catch (error) {
      setIsUploading(false);
      setIsSaving(false);
      const errorMsg = 'Error processing resume: ' + (error instanceof Error ? error.message : String(error));
      setErrorMessage(errorMsg);
      onError(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700 p-6 transition-all duration-300">
        <div className="flex flex-col space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-dashed border-blue-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleUploadClick}
                className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center mx-auto"
                disabled={isUploading || isSaving}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                {file ? 'Change File' : 'Select Resume'}
              </button>
              
              {file && (
                <div className="mt-3 text-slate-300">
                  <span className="font-medium text-blue-400">{file.name}</span>
                  <span className="text-sm text-slate-400 ml-2">({Math.round(file.size / 1024)} KB)</span>
                </div>
              )}
            </div>
            
            <div className="text-slate-400 text-sm text-center">
              Accepted formats: PDF, Word documents (.pdf, .doc, .docx)
              <br />
              Maximum file size: 5MB
            </div>
          </div>
          
          {file && (
            <button
              type="button"
              onClick={handleUploadAndParse}
              className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center justify-center"
              disabled={isUploading || isSaving}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  Process Resume
                </>
              )}
            </button>
          )}
          
          {errorMessage && (
            <div className="mt-4 text-red-400 bg-red-900/20 px-4 py-3 rounded-lg border border-red-500/30 flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadForm; 