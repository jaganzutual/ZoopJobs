import pytest
import os
import tempfile
import json
from unittest.mock import patch, MagicMock
from services.resume_parser import ResumeParser


class TestResumeParser:
    """Test suite for the ResumeParser service"""

    @patch('services.resume_parser.openai.OpenAI')
    def test_init(self, mock_openai):
        """Test ResumeParser initialization"""
        # Setup mock
        mock_openai.return_value = MagicMock()
        
        # Call the constructor
        parser = ResumeParser()
        
        # Verify OpenAI was initialized with the correct parameters
        mock_openai.assert_called_once()

    @patch('services.resume_parser.PdfReader')
    def test_extract_text_from_pdf(self, mock_pdf_reader):
        """Test extracting text from PDF"""
        # Setup mock
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Page 1 content"
        mock_page2 = MagicMock()
        mock_page2.extract_text.return_value = "Page 2 content"
        
        mock_reader_instance = MagicMock()
        mock_reader_instance.pages = [mock_page1, mock_page2]
        mock_pdf_reader.return_value = mock_reader_instance
        
        # Call the method with a mock client
        mock_client = MagicMock()
        parser = ResumeParser(mock_client=mock_client)
        text = parser._extract_text_from_pdf("dummy.pdf")
        
        # Verify PDF reader was used correctly
        mock_pdf_reader.assert_called_once_with("dummy.pdf")
        
        # Verify text was extracted correctly
        assert text == "Page 1 content Page 2 content "

    @patch('builtins.open', new_callable=MagicMock)
    def test_extract_text_from_txt(self, mock_open):
        """Test extracting text from TXT"""
        # Setup mock
        mock_file = MagicMock()
        mock_file.__enter__.return_value.read.return_value = "Text file content"
        mock_open.return_value = mock_file
        
        # Call the method with a mock client
        mock_client = MagicMock()
        parser = ResumeParser(mock_client=mock_client)
        text = parser._extract_text_from_txt("dummy.txt")
        
        # Verify file was opened correctly
        mock_open.assert_called_once_with("dummy.txt", 'r', encoding='utf-8')
        
        # Verify text was extracted correctly
        assert text == "Text file content"

    def test_extract_text(self):
        """Test the extract_text method which delegates based on file extension"""
        mock_client = MagicMock()
        parser = ResumeParser(mock_client=mock_client)
        
        # Mock the individual extraction methods
        parser._extract_text_from_pdf = MagicMock(return_value="PDF content")
        parser._extract_text_from_txt = MagicMock(return_value="TXT content")
        
        # Test PDF extraction
        pdf_text = parser.extract_text("test.pdf", ".pdf")
        assert pdf_text == "PDF content"
        parser._extract_text_from_pdf.assert_called_once_with("test.pdf")
        
        # Test TXT extraction
        txt_text = parser.extract_text("test.txt", ".txt")
        assert txt_text == "TXT content"
        parser._extract_text_from_txt.assert_called_once_with("test.txt")
        
        # Test unsupported format
        unsupported_text = parser.extract_text("test.jpg", ".jpg")
        assert unsupported_text == ""

    def test_parse_resume(self):
        """Test resume parsing with OpenAI"""
        # Setup mock client and completion response
        mock_client = MagicMock()
        mock_message = MagicMock()
        mock_message.content = json.dumps({
            "personal_info": {
                "name": "John Doe",
                "email": "john@example.com"
            },
            "education": [
                {
                    "institution": "MIT",
                    "degree": "BS"
                }
            ],
            "work_experience": [
                {
                    "company": "Google",
                    "job_title": "Engineer"
                }
            ],
            "skills": [
                {
                    "name": "Python",
                    "category": "Programming"
                }
            ]
        })
        
        mock_choice = MagicMock()
        mock_choice.message = mock_message
        
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        
        mock_client.chat.completions.create.return_value = mock_response
        
        # Create parser with mock client
        parser = ResumeParser(mock_client=mock_client)
        
        # Call the method
        result = parser.parse_resume("Sample resume text")
        
        # Verify OpenAI API was called correctly
        mock_client.chat.completions.create.assert_called_once()
        call_args = mock_client.chat.completions.create.call_args[1]
        assert call_args["model"] == "gpt-4"
        assert call_args["temperature"] == 0
        assert len(call_args["messages"]) == 2
        assert call_args["messages"][1]["content"] == "Sample resume text"
        assert call_args["response_format"] == {"type": "json_object"}
        
        # Verify parsed data
        assert "personal_info" in result
        assert result["personal_info"]["name"] == "John Doe"
        assert len(result["education"]) == 1
        assert result["education"][0]["institution"] == "MIT"
        assert len(result["work_experience"]) == 1
        assert result["work_experience"][0]["company"] == "Google"
        assert len(result["skills"]) == 1
        assert result["skills"][0]["name"] == "Python"

    def test_parse_resume_error_handling(self):
        """Test error handling in parse_resume"""
        # Setup mock to raise an exception
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = Exception("API error")
        
        parser = ResumeParser(mock_client=mock_client)
        
        # Call the method
        result = parser.parse_resume("Sample resume text")
        
        # Verify error handling
        assert "personal_info" in result
        assert "education" in result
        assert "work_experience" in result
        assert "skills" in result
        
        # All should be empty defaults
        assert result["personal_info"] == {}
        assert result["education"] == []
        assert result["work_experience"] == []
        assert result["skills"] == []

    @patch.object(ResumeParser, 'extract_text')
    @patch.object(ResumeParser, 'parse_resume')
    async def test_parse_uploaded_resume(self, mock_parse_resume, mock_extract_text):
        """Test parsing an uploaded resume file"""
        # Setup mocks
        mock_extract_text.return_value = "Sample resume text"
        mock_parse_resume.return_value = {
            "personal_info": {"name": "John Doe"},
            "education": [],
            "work_experience": [],
            "skills": []
        }
        
        # Create a mock file
        mock_file = MagicMock()
        mock_file.filename = "resume.pdf"
        mock_file.read = MagicMock(return_value=b"PDF content")
        
        # Call the method with a mock client
        mock_client = MagicMock()
        parser = ResumeParser(mock_client=mock_client)
        result = await parser.parse_uploaded_resume(mock_file)
        
        # Verify the file was processed correctly
        mock_file.read.assert_called_once()
        assert mock_extract_text.called
        mock_parse_resume.assert_called_once_with("Sample resume text")
        
        # Verify result
        assert result["personal_info"]["name"] == "John Doe"

    @patch.object(ResumeParser, 'extract_text')
    async def test_parse_uploaded_resume_empty_text(self, mock_extract_text):
        """Test parsing with no extracted text"""
        # Setup mock to return empty text
        mock_extract_text.return_value = ""
        
        # Create a mock file
        mock_file = MagicMock()
        mock_file.filename = "resume.pdf"
        mock_file.read = MagicMock(return_value=b"PDF content")
        
        # Call the method with a mock client
        mock_client = MagicMock()
        parser = ResumeParser(mock_client=mock_client)
        result = await parser.parse_uploaded_resume(mock_file)
        
        # Verify result has default empty structure
        assert result["personal_info"] == {}
        assert result["education"] == []
        assert result["work_experience"] == []
        assert result["skills"] == [] 