export default function BookLayout({ children }) {
  return (
    <>
      <style>{`
        html, body { background: #091624 !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 4px; }
        html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: #091624; }
        html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: rgba(79,195,247,0.15); border-radius: 4px; }
        html::-webkit-scrollbar-thumb:hover, body::-webkit-scrollbar-thumb:hover { background: rgba(79,195,247,0.3); }
        html { scrollbar-width: thin; scrollbar-color: rgba(79,195,247,0.15) #091624; }
      `}</style>
      {children}
    </>
  )
}
