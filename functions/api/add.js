// 使用 UUID 作为 ID
const uuid = () => crypto.randomUUID(); 

/** 简单的日期格式化 (YYYY-MM-DD) */
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json().catch(() => ({})); 
    
    const { name, interval_type, interval_value, next_due_date } = body;
    
    if (!name || !['month', 'day'].includes(interval_type) || typeof interval_value !== 'number' || !next_due_date) {
        return new Response(JSON.stringify({ message: 'Missing or invalid required fields (name, interval_type, interval_value, next_due_date).' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
    
    const id = uuid(); 
    const last_modified_date = formatDate(new Date());

    try {
        // 注意：Pages Functions 绑定 D1 数据库到 env.DB (无需手动在 Worker 中设置)
        const db = env.DB; 
        
        await db.prepare(
            `INSERT INTO reminders (id, name, interval_type, interval_value, last_modified_date, next_due_date) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
        ).bind(id, name, interval_type, interval_value, last_modified_date, next_due_date).run();
        
    } catch (e) {
        console.error("DB Error:", e.message);
        return new Response(JSON.stringify({ message: `DB Error: ${e.message}` }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    return new Response(JSON.stringify({ message: 'Reminder added successfully.', id: id }), { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
    });
}
