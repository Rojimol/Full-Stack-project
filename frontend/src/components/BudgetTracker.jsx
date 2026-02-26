import { DollarSign, TrendingUp, TrendingDown, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';

const BudgetTracker = ({ userId }) => {
  const [estimated, setEstimated] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchBudget = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await budgetAPI.get(userId);
        setEstimated(res.data.estimated || 0);
        setExpenses(res.data.expenses || []);
      } catch (err) {
        console.error('Failed to fetch budget:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudget();
  }, [userId]);

  const save = async (nextEstimated, nextExpenses) => {
    try {
      setIsSaving(true);
      setSaveStatus('Saving...');
      await budgetAPI.update(userId, {
        estimated: nextEstimated,
        expenses: nextExpenses
      });
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Failed to save budget:', err);
      setSaveStatus('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = (estimated || 0) - total;

  const updateEstimated = (value) => {
    const nextVal = parseFloat(value) || 0;
    setEstimated(nextVal);
  };

  // Debounce save for estimated budget
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userId) {
        save(estimated, expenses);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [estimated]);

  const addExpense = () => {
    const amount = parseFloat(newExpense.amount);
    if (!newExpense.category || isNaN(amount) || amount <= 0) return;
    const item = { category: newExpense.category, amount };
    const nextExpenses = [...expenses, item];
    setExpenses(nextExpenses);
    save(estimated, nextExpenses);
    setNewExpense({ category: '', amount: '' });
  };

  const removeExpense = (index) => {
    const nextExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(nextExpenses);
    save(estimated, nextExpenses);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
    </div>
  );

  return (
    <div className="space-y-12 text-slate-900 relative">
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />

      {saveStatus && (
        <div className={`fixed top-28 right-12 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-3xl z-[100] animate-in fade-in slide-in-from-right-8 duration-500 border backdrop-blur-2xl ${
          saveStatus === 'Saved' 
          ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' 
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${saveStatus === 'Saved' ? 'bg-brand-blue' : 'bg-rose-500'}`} />
            {saveStatus}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-brand-blue/30 transition-all group relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="bg-brand-blue/10 text-brand-blue w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-brand-blue/20">
              <DollarSign size={28} />
            </div>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Fiscal Goal</p>
          </div>
          <p className="text-4xl font-black text-slate-900 mb-6 relative z-10 tracking-tighter">₹{estimated.toLocaleString()}</p>
          <div className="relative z-10">
            <input
              type="number"
              value={estimated || ''}
              onChange={(e) => updateEstimated(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-900 focus:bg-white focus:border-brand-blue/40 outline-none transition-all placeholder:text-brand-gray uppercase tracking-widest"
              placeholder="Set Budget Limit"
            />
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-brand-blue/30 transition-all group relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="bg-brand-blue/10 text-brand-blue w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-brand-blue/20">
              <TrendingUp size={28} />
            </div>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Current Outflow</p>
          </div>
          <p className="text-4xl font-black text-slate-900 mb-4 relative z-10 tracking-tighter">₹{total.toLocaleString()}</p>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-6 relative z-10 border border-slate-200/50">
            <div 
              className={`h-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(41,121,255,0.2)] ${total > estimated ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-brand-blue to-blue-400'}`}
              style={{ width: `${Math.min((total / (estimated || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className={`p-10 rounded-[3.5rem] border shadow-xl shadow-slate-200/50 hover:border-brand-blue/30 transition-all group relative overflow-hidden animate-slide-up ${
          remaining >= 0 ? 'bg-white border-slate-100' : 'bg-rose-50 border-rose-100'
        }`} style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border ${
              remaining >= 0 ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
              {remaining >= 0 ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
            </div>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Net Variance</p>
          </div>
          <p className={`text-4xl font-black tracking-tighter relative z-10 ${remaining >= 0 ? 'text-slate-900' : 'text-rose-500'}`}>
            ₹{remaining.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${remaining >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest">
              {remaining >= 0 ? 'Optimal Liquidity' : 'Budget Overrun Detected'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 relative z-10 tracking-tight">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
              <Plus size={20} />
            </div>
            Log Expense
          </h3>
          <div className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-gray uppercase tracking-[0.3em] ml-2">Category Identification</label>
              <input
                type="text"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                placeholder="e.g. Flight, Sustenance, Lodging"
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-bold text-sm focus:border-brand-blue/40 focus:bg-white outline-none transition-all shadow-sm placeholder:text-brand-gray/50"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-gray uppercase tracking-[0.3em] ml-2">Monetary Amount (₹)</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-bold text-sm focus:border-brand-blue/40 focus:bg-white outline-none transition-all shadow-sm placeholder:text-brand-gray/50"
              />
            </div>
            <button 
              onClick={addExpense}
              className="group relative w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl hover:bg-brand-blue shadow-2xl hover:shadow-brand-blue/30 transition-all duration-500 active:scale-[0.98] mt-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-blue translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                Commit Transaction
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-10 px-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Ledger</h3>
            <div className="text-[10px] font-black text-brand-gray uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              {expenses.length} Records
            </div>
          </div>
          <div className="space-y-5 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
            {expenses.map((expense, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:border-brand-blue/30 transition-all group relative overflow-hidden animate-slide-up"
                style={{ animationDelay: `${0.6 + (index * 0.05)}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-brand-gray group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-all duration-500">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="font-black text-xl text-slate-900 group-hover:text-brand-blue transition-colors duration-300">{expense.category}</p>
                    <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] mt-1">Operational Expense</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 relative z-10">
                  <span className="font-black text-2xl text-slate-900 tracking-tight">₹{expense.amount.toLocaleString()}</span>
                  <button 
                    onClick={() => removeExpense(index)} 
                    className="w-12 h-12 flex items-center justify-center text-brand-gray hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                    title="Delete Transaction"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 animate-slide-up">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                  <DollarSign size={40} className="text-slate-400" />
                </div>
                <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Fiscal Activity</h4>
                <p className="text-brand-gray text-xs font-bold mt-2 uppercase tracking-[0.2em]">Ready to track your first transaction</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
