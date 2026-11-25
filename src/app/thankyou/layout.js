export default function BookLayout({ children }) {
  return (
    <>
      <style>{`
        html, body { background: #091624 !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 6px; }
        html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: rgba(79,195,247,0.04); }
        html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: rgba(79,195,247,0.25); border-radius: 6px; }
        html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover { background: rgba(79,195,247,0.4); }
        html { scrollbar-width: thin; scrollbar-color: rgba(79,195,247,0.25) rgba(79,195,247,0.04); }
      `}</style>
      {children}
    </>
  )
}
