'use client';

import React, { useState, useEffect } from 'react';
import { CourseService } from '@/services/data.service';
import { Course } from '@/types';
import { BookOpen, Plus, Trash2, Calendar, Users, DollarSign } from 'lucide-react';
import { LoadingSpinner, EmptyState, ErrorState, AlertBanner } from '@/components/UIState';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    content: 'شرح ومراجعة وحل تدريبات وبنك أسئلة',
    academicYear: 'GRADE_12' as 'GRADE_10' | 'GRADE_11' | 'GRADE_12',
    price: 350,
    schedule: 'السبت والثلاثاء 6:00 مساءً',
    capacity: 25,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await CourseService.getCourses();
      if (res.success && Array.isArray(res.data)) {
        setCourses(res.data);
      } else {
        setCourses([]);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل الكورسات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await CourseService.createCourse(newCourse);
      if (res.success) {
        setActionSuccess('تم إنشاء الكورس والمجموعة بنجاح!');
        setShowAddModal(false);
        fetchCourses();
      }
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء الكورس');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟')) return;
    try {
      await CourseService.deleteCourse(id);
      setActionSuccess('تم حذف الكورس بنجاح.');
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'فشل في حذف الكورس');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الكورسات والمجموعات</h1>
          <p className="text-xs text-slate-400 mt-1">
            إضافة مواعيد الحصص والأسعار والسعة الاستيعابية لكل مجموعة
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كورس أو مجموعة جديدة</span>
        </button>
      </div>

      {actionSuccess && <AlertBanner type="success" message={actionSuccess} />}
      {error && <AlertBanner type="error" message={error} />}

      {/* Modal Add Course */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <h2 className="text-lg font-bold text-white">إضافة كورس / مجموعة فيزياء</h2>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الكورس / المجموعة *</label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="مثال: كورس فيزياء كهربية ومكثف 3 ثانوي"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المرحلة الدراسية</label>
                  <select
                    value={newCourse.academicYear}
                    onChange={(e: any) => setNewCourse({ ...newCourse, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="GRADE_12">الصف الثالث الثانوي</option>
                    <option value="GRADE_11">الصف الثاني الثانوي</option>
                    <option value="GRADE_10">الصف الأول الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر (ج.م / شهر)</label>
                  <input
                    type="number"
                    required
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المواعيد</label>
                  <input
                    type="text"
                    required
                    value={newCourse.schedule}
                    onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                    placeholder="مثال: الأحد والأربعاء 5:00 م"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعة القصوى للمقاعد</label>
                  <input
                    type="number"
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({ ...newCourse, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تفاصيل المحتوى</label>
                <textarea
                  rows={3}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="اكتب وصف المنهج ومميزات هذه المجموعة..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl"
                >
                  حفظ ونشر الكورس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingSpinner text="جاري جلب الكورسات والمجموعات..." />
      ) : courses.length === 0 ? (
        <EmptyState
          title="لا توجد كورسات معلنة بعد"
          description="اضغط على زر (إضافة كورس أو مجموعة جديدة) لفتح باب الحجز."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {course.academicYear === 'GRADE_12' ? '3 ثانوي' : course.academicYear === 'GRADE_11' ? '2 ثانوي' : '1 ثانوي'}
                  </span>
                  <span className="text-sm font-black text-amber-400">{course.price} ج.م</span>
                </div>

                <h3 className="font-extrabold text-base text-white">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary-400" />
                    <span>{course.schedule}</span>
                  </div>

                  {course.capacity && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        المقاعد:
                      </span>
                      <span className="font-bold text-white">
                        {course.activeBookingsCount} / {course.capacity}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    course.isAvailable ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                  }`}
                >
                  {course.isAvailable ? 'متاح للحجز' : 'مغلق'}
                </span>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="حذف الكورس"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
