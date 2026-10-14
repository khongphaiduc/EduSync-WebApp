import type {
  ScheduleItem,
  ClassItem,
  ApplicationRequest,
  StudentGrade,
  FacultyStat,
  SectionClassItem,
  ActivityEvent
} from './types'

export const TODAY_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '08:00 - 09:45',
    subject: 'Lập trình Web nâng cao',
    classCode: 'SE1623',
    room: 'Phòng A402 - Tòa A',
    lessonNumber: 'Buổi 5/15',
    totalLessons: 15,
    dayOfWeek: 'Thứ Ba'
  },
  {
    id: 'sch-2',
    time: '10:00 - 11:45',
    subject: 'Cơ sở dữ liệu',
    classCode: 'SE1234',
    room: 'Phòng A301 - Tòa A',
    lessonNumber: 'Buổi 8/15',
    totalLessons: 15,
    dayOfWeek: 'Thứ Ba'
  },
  {
    id: 'sch-3',
    time: '13:00 - 14:45',
    subject: 'Phát triển ứng dụng di động',
    classCode: 'SE1710',
    room: 'Phòng B201 - Tòa B',
    lessonNumber: 'Buổi 3/15',
    totalLessons: 15,
    dayOfWeek: 'Thứ Ba'
  }
]

export const MY_CLASSES: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'Lập trình Web nâng cao',
    code: 'SE1623',
    semester: 'HK1 2026 - 2027',
    studentsCount: 45,
    status: 'active',
    statusText: 'Đang học',
    typeIcon: 'code'
  },
  {
    id: 'cls-2',
    name: 'Cơ sở dữ liệu',
    code: 'SE1234',
    semester: 'HK1 2026 - 2027',
    studentsCount: 38,
    status: 'active',
    statusText: 'Đang học',
    typeIcon: 'database'
  },
  {
    id: 'cls-3',
    name: 'Phát triển ứng dụng di động',
    code: 'SE1710',
    semester: 'HK1 2026 - 2027',
    studentsCount: 42,
    status: 'active',
    statusText: 'Đang học',
    typeIcon: 'mobile'
  },
  {
    id: 'cls-4',
    name: 'Kiến trúc phần mềm',
    code: 'SE1805',
    semester: 'HK1 2026 - 2027',
    studentsCount: 31,
    status: 'upcoming',
    statusText: 'Chưa bắt đầu',
    typeIcon: 'architecture'
  }
]

export const INITIAL_REQUESTS: ApplicationRequest[] = [
  {
    id: 'req-1',
    studentName: 'Trần Thị Mai',
    studentCode: 'SE200123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    requestType: 'Xin nghỉ học',
    submissionDate: '14/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Em bị sốt xuất huyết phải nhập viện điều trị tại Bệnh viện Bạch Mai từ ngày 14/10 đến 16/10. Em xin phép thầy cho em nghỉ học buổi hôm nay và nộp bổ sung giấy ra viện sau ạ.',
    className: 'SE1623',
    courseName: 'Lập trình Web nâng cao',
    attachment: 'Giay_nhap_vien_1410.pdf'
  },
  {
    id: 'req-2',
    studentName: 'Lê Quang Huy',
    studentCode: 'SE200456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    requestType: 'Phúc khảo điểm',
    submissionDate: '13/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Kính gửi thầy An, em nhận thấy bài kiểm tra giữa kỳ câu 3 phần tối ưu hóa truy vấn SQL em đã làm đủ các bước indexed join nhưng điểm thành phần câu này chỉ được 1/3 điểm. Em kính mong thầy xem xét chấm lại bài thi giúp em ạ.',
    className: 'SE1234',
    courseName: 'Cơ sở dữ liệu',
    attachment: 'Bai_lam_giua_ky_LeQuangHuy.pdf'
  },
  {
    id: 'req-3',
    studentName: 'Phạm Minh Anh',
    studentCode: 'SE200789',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    requestType: 'Bảo lưu kết quả',
    submissionDate: '12/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Do hoàn cảnh gia đình có việc đột xuất và em cần về quê hỗ trợ gia đình trong 1 kỳ học, em xin phép thầy xác nhận điểm quá trình để em làm thủ tục bảo lưu tại phòng đào tạo ạ.',
    className: 'SE1710',
    courseName: 'Phát triển ứng dụng di động',
    attachment: 'Don_bao_luu_MinhAnh.pdf'
  },
  {
    id: 'req-4',
    studentName: 'Nguyễn Thị Lan',
    studentCode: 'SE201234',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    requestType: 'Xin hoãn thi',
    submissionDate: '12/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Em bị trùng lịch thi chứng chỉ tiếng Anh quốc tế IELTS vào ngày thi cuối kỳ của môn học. Em kính xin phép thầy và nhà trường cho em thi đợt bổ sung vào tuần kế tiếp ạ.',
    className: 'SE1623',
    courseName: 'Lập trình Web nâng cao',
    attachment: 'Lich_thi_IELTS_Lan.pdf'
  },
  {
    id: 'req-5',
    studentName: 'Vũ Hoàng Long',
    studentCode: 'SE201567',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    requestType: 'Xin nghỉ học',
    submissionDate: '11/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Tham gia vòng chung kết cuộc thi lập trình Olympic Tin học sinh viên toàn quốc.',
    className: 'SE1623',
    courseName: 'Lập trình Web nâng cao'
  },
  {
    id: 'req-6',
    studentName: 'Đỗ Quỳnh Chi',
    studentCode: 'SE201890',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    requestType: 'Phúc khảo điểm',
    submissionDate: '10/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Xin phúc khảo điểm bài kiểm tra lab 2 môn Cơ sở dữ liệu.',
    className: 'SE1234',
    courseName: 'Cơ sở dữ liệu'
  },
  {
    id: 'req-7',
    studentName: 'Hoàng Quốc Bảo',
    studentCode: 'SE202112',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    requestType: 'Xin nghỉ học',
    submissionDate: '10/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Xin nghỉ do trùng lịch khám sức khỏe nghĩa vụ quân sự tại địa phương.',
    className: 'SE1710',
    courseName: 'Phát triển ứng dụng di động'
  },
  {
    id: 'req-8',
    studentName: 'Bùi Phương Thảo',
    studentCode: 'SE202334',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    requestType: 'Phúc khảo điểm',
    submissionDate: '09/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Xin xem lại điểm quiz trắc nghiệm số 3 phần Normalization.',
    className: 'SE1234',
    courseName: 'Cơ sở dữ liệu'
  },
  {
    id: 'req-9',
    studentName: 'Trịnh Quốc Toàn',
    studentCode: 'SE202556',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    requestType: 'Xin hoãn thi',
    submissionDate: '09/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Bị tai nạn giao thông nhẹ cần điều trị phục hồi 1 tuần.',
    className: 'SE1623',
    courseName: 'Lập trình Web nâng cao'
  },
  {
    id: 'req-10',
    studentName: 'Võ Thảo My',
    studentCode: 'SE202778',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    requestType: 'Xin nghỉ học',
    submissionDate: '08/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Có việc hiếu gia đình ở quê.',
    className: 'SE1710',
    courseName: 'Phát triển ứng dụng di động'
  },
  {
    id: 'req-11',
    studentName: 'Đặng Minh Trí',
    studentCode: 'SE202990',
    avatar: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=150&auto=format&fit=crop&q=80',
    requestType: 'Phúc khảo điểm',
    submissionDate: '08/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Đề nghị xem lại điểm bài thực hành CSS Grid và Responsive.',
    className: 'SE1623',
    courseName: 'Lập trình Web nâng cao'
  },
  {
    id: 'req-12',
    studentName: 'Lâm Khánh Vân',
    studentCode: 'SE203212',
    avatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=150&auto=format&fit=crop&q=80',
    requestType: 'Bảo lưu kết quả',
    submissionDate: '07/10/2026',
    status: 'pending',
    statusText: 'Chờ duyệt',
    reason: 'Tham gia chương trình trao đổi sinh viên quốc tế tại Nhật Bản.',
    className: 'SE1805',
    courseName: 'Kiến trúc phần mềm'
  }
]

export const INITIAL_STUDENTS_GRADES: Record<string, StudentGrade[]> = {
  SE1623: [
    {
      id: 'g-1',
      studentCode: 'SE200123',
      fullName: 'Trần Thị Mai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      attendance: 9.5,
      midterm: 8.5,
      practical: 9.0,
      finalExam: 8.5,
      totalScore: 8.7,
      letterGrade: 'A',
      status: 'Đạt',
      notes: 'Học lực xuất sắc, tích cực phát biểu'
    },
    {
      id: 'g-2',
      studentCode: 'SE200456',
      fullName: 'Lê Quang Huy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      attendance: 9.0,
      midterm: 7.5,
      practical: 8.0,
      finalExam: 7.0,
      totalScore: 7.5,
      letterGrade: 'B+',
      status: 'Đạt'
    },
    {
      id: 'g-3',
      studentCode: 'SE200789',
      fullName: 'Phạm Minh Anh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      attendance: 8.0,
      midterm: 6.0,
      practical: 7.0,
      finalExam: 6.5,
      totalScore: 6.6,
      letterGrade: 'C+',
      status: 'Đạt'
    },
    {
      id: 'g-4',
      studentCode: 'SE201234',
      fullName: 'Nguyễn Thị Lan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      attendance: 10.0,
      midterm: 9.0,
      practical: 9.5,
      finalExam: 9.0,
      totalScore: 9.2,
      letterGrade: 'A+',
      status: 'Đạt',
      notes: 'Thủ khoa bài tập lớn'
    },
    {
      id: 'g-5',
      studentCode: 'SE201567',
      fullName: 'Vũ Hoàng Long',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      attendance: 6.0,
      midterm: 4.5,
      practical: 5.0,
      finalExam: 4.0,
      totalScore: 4.6,
      letterGrade: 'D',
      status: 'Cảnh báo',
      notes: 'Cần cải thiện chuyên cần'
    },
    {
      id: 'g-6',
      studentCode: 'SE201890',
      fullName: 'Đỗ Quỳnh Chi',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      attendance: 8.5,
      midterm: 8.0,
      practical: 8.5,
      finalExam: 8.0,
      totalScore: 8.2,
      letterGrade: 'B+',
      status: 'Đạt'
    },
    {
      id: 'g-7',
      studentCode: 'SE202112',
      fullName: 'Hoàng Quốc Bảo',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      attendance: 9.0,
      midterm: 8.0,
      practical: 8.0,
      finalExam: 8.5,
      totalScore: 8.3,
      letterGrade: 'B+',
      status: 'Đạt'
    },
    {
      id: 'g-8',
      studentCode: 'SE202334',
      fullName: 'Bùi Phương Thảo',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      attendance: 10.0,
      midterm: 9.5,
      practical: 9.0,
      finalExam: 9.5,
      totalScore: 9.5,
      letterGrade: 'A+',
      status: 'Đạt'
    }
  ]
}

export const ADMIN_FACULTIES_STATS: FacultyStat[] = [
  { faculty: 'Khoa CNTT', students: 450, teachers: 120, sections: 270 },
  { faculty: 'Khoa Kinh tế', students: 300, teachers: 85, sections: 160 },
  { faculty: 'Khoa QTKD', students: 360, teachers: 95, sections: 180 },
  { faculty: 'Khoa Ngoại ngữ', students: 310, teachers: 70, sections: 150 },
  { faculty: 'Khoa Khác', students: 220, teachers: 50, sections: 130 }
]

export const ADMIN_NEW_SECTIONS: SectionClassItem[] = [
  {
    id: 'sec-1',
    code: 'SE1801',
    subjectName: 'Lập trình .NET',
    teacherName: 'Nguyễn Văn An',
    studentCount: 45,
    semester: 'HK1 2026',
    status: 'active',
    statusText: 'Đang diễn ra'
  },
  {
    id: 'sec-2',
    code: 'SE1802',
    subjectName: 'Cơ sở dữ liệu',
    teacherName: 'Trần Thị Mai',
    studentCount: 38,
    semester: 'HK1 2026',
    status: 'active',
    statusText: 'Đang diễn ra'
  },
  {
    id: 'sec-3',
    code: 'SE1803',
    subjectName: 'Phát triển web',
    teacherName: 'Lê Quang Huy',
    studentCount: 42,
    semester: 'HK1 2026',
    status: 'upcoming',
    statusText: 'Chưa bắt đầu'
  },
  {
    id: 'sec-4',
    code: 'SE1804',
    subjectName: 'Kiến trúc phần mềm',
    teacherName: 'Phạm Minh Anh',
    studentCount: 31,
    semester: 'HK1 2026',
    status: 'active',
    statusText: 'Đang diễn ra'
  },
  {
    id: 'sec-5',
    code: 'SE1805',
    subjectName: 'Mạng máy tính',
    teacherName: 'Nguyễn Thị Lan',
    studentCount: 40,
    semester: 'HK1 2026',
    status: 'completed',
    statusText: 'Đã kết thúc'
  }
]

export const ADMIN_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    time: '08:00',
    title: 'Họp khoa CNTT',
    location: 'Phòng A201',
    color: 'blue'
  },
  {
    id: 'act-2',
    time: '10:00',
    title: 'Duyệt kế hoạch học kỳ',
    location: 'Phòng họp B',
    color: 'pink'
  },
  {
    id: 'act-3',
    time: '14:00',
    title: 'Phân công giảng viên',
    location: 'Phòng A101',
    color: 'orange'
  },
  {
    id: 'act-4',
    time: '16:30',
    title: 'Kiểm tra tiến độ nhập điểm',
    location: 'Online (Google Meet)',
    color: 'blue'
  }
]

export const ADMIN_RECENT_REQUESTS = [
  {
    id: 'areq-1',
    date: '13/10/2026',
    studentName: 'Trần Thị Mai',
    requestType: 'Xin nghỉ học',
    status: 'Chờ duyệt'
  },
  {
    id: 'areq-2',
    date: '12/10/2026',
    studentName: 'Lê Quang Huy',
    requestType: 'Phúc khảo',
    status: 'Chờ duyệt'
  },
  {
    id: 'areq-3',
    date: '11/10/2026',
    studentName: 'Phạm Minh Anh',
    requestType: 'Bảo lưu kết quả',
    status: 'Chờ duyệt'
  },
  {
    id: 'areq-4',
    date: '10/10/2026',
    studentName: 'Nguyễn Thị Lan',
    requestType: 'Xin hoãn thi',
    status: 'Chờ duyệt'
  }
]

