export interface ResumeParseResponse {
  personal_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  skills: Array<{ name: string; years: number }>;
  work_experience: Array<{
    company: string;
    job_title: string;
    start_date: string;
    end_date: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
  }>;
}

const mockResponse: ResumeParseResponse = {
  personal_info: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York'
  },
  skills: [{ name: 'JavaScript', years: 3 }, { name: 'React', years: 2 }],
  work_experience: [{
    company: 'Example Corp',
    job_title: 'Senior Developer',
    start_date: '2020',
    end_date: 'Present'
  }],
  education: [{
    institution: 'University of Example',
    degree: 'Bachelor of Science',
    field_of_study: 'Computer Science',
    start_date: '2016',
    end_date: '2020'
  }]
};

export const uploadResume = jest.fn().mockResolvedValue(mockResponse);
export const saveResume = jest.fn().mockResolvedValue({
  id: 1,
  file_name: 'resume.pdf',
  parsed_data: mockResponse
}); 