import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DepartmentList from './pages/DepartmentList';
import ProjectList from './pages/ProjectList';
import TaskList from './pages/TaskList';
import TagList from './pages/TagList';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tags" element={<TagList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
