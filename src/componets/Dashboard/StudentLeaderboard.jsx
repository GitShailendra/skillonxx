import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy,Medal,Award } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function StudentLeaderboard() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const devUrl = 'http://localhost:5000';
  const prodUrl = 'https://skillonx-server.onrender.com';
  const baseUrl = process.env.NODE_ENV === 'production' ? prodUrl : devUrl;
  const handleStudentClick = (studentId) => {
    navigate(`/university-dashboard/student-detail/${studentId}`);
  };
  const processStudentData = (studentsData) => {
    return studentsData
      .filter(student => {
        return student.assessmentResults && student.assessmentResults.length > 0;
      })
      .map(student => {
        const workshopAssessments = student.assessmentResults.reduce((acc, result) => {
          const workshopId = result.workshopId;
          if (!acc[workshopId]) {
            acc[workshopId] = [];
          }
          acc[workshopId].push(result);
          return acc;
        }, {});

        const workshopScores = Object.values(workshopAssessments).map(assessments => {
          const workshopTotal = assessments.reduce((sum, result) => {
            return sum + (result.score?.obtainedMarks / result.score?.totalMarks * 100 || 0);
          }, 0);
          return workshopTotal / assessments.length;
        });

        const overallScore = workshopScores.length > 0
          ? (workshopScores.reduce((sum, score) => sum + score, 0) / workshopScores.length).toFixed(2)
          : 0;

        return {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          score: Number(overallScore),
          assessmentCount: student.assessmentResults?.length || 0,
          workshopCount: Object.keys(workshopAssessments).length
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  // Rest of the component remains the same
  // console.log(auth.user.universityName)
  useEffect(() => {
    const fetchStudentRankings = async () => {
      const uniId = auth.user._id;
      const token = localStorage.getItem('token');
      
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${prodUrl}/student/rankings/${uniId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const processedData = processStudentData(response.data.data);
        setStudents(processedData);
      } catch (err) {
        setError('Failed to load rankings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentRankings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-t-teal-500 border-b-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch(rank) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1: return <Medal className="h-6 w-6 text-gray-300" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-t-teal-500 border-b-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {students.slice(0, 3).map((student, index) => (
          <div 
            key={student.id} 
            className={`bg-gray-800 rounded-lg shadow-lg border ${
              index === 0 ? 'border-yellow-400' : 
              index === 1 ? 'border-gray-400' : 
              'border-amber-600'
            } p-4`}
          >
            <div className="flex items-center gap-4">
              {getRankIcon(index)}
              <div>
                <h3 className="font-medium text-gray-100">{student.name}</h3>
                <p className="text-sm text-gray-400">{student.email}</p>
                <div className="mt-2">
                  <span className="text-lg font-bold text-teal-400">{student.score}%</span>
                  <span className="text-sm text-gray-400"> average score</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {student.assessmentCount} assessments from {student.workshopCount} workshops
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-100">Complete Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Rank</th>
                <th className="text-left py-3 px-4 text-gray-400">Student</th>
                <th className="text-left py-3 px-4 text-gray-400">Email</th>
                <th className="text-right py-3 px-4 text-gray-400">Score</th>
                <th className="text-right py-3 px-4 text-gray-400">Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} 
                className="border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleStudentClick(student.id)}
                >
                  <td className="py-3 px-4 text-gray-300">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {index < 3 && getRankIcon(index)}
                      <span className="text-gray-100">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{student.email}</td>
                  <td className="py-3 px-4 text-right text-teal-400">{student.score}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-teal-500 h-2 rounded-full"
                          style={{ width: `${student.score}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 min-w-[120px]">
                        {/* {student.assessmentCount} from {student.workshopCount} workshops */}
                        Total {student.assessmentCount} Assesments
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}