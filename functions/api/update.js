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

/** 简单的日期加法 */
function addDate(dateStr, value, type) {
    const d = new Date(dateStr);
    
    if (type === 'day') {
        d.setDate(d.getDate() + value);
    } else if (type === 'month') {
        // setMonth 会处理跨年
        d.setMonth(d.getMonth() + value);
    }
    
    return formatDate(d);
}


export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json().catch(() => ({})); 

    // ID, 周期类型, 周期值 是必需的
    const { id, interval_type, interval_value } = body; 

    if (!id || !['month', 'day'].includes(interval_type) || typeof interval_value !== 'number') {
        return new Response(JSON.stringify({ message: 'Missing or invalid required fields (id, interval_type, interval_value).' }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    // 计算新的下次提醒日期：从今天开始 + 周期
    const todayStr = formatDate(new Date());
    const new_due_date = addDate(todayStr, interval_value, interval_type);

    try {
        const db = env.DB; 
        
        const result = await db.prepare(
            `UPDATE reminders SET next_due_date = ?1, last_modified_date = ?2 WHERE id = ?3`
        ).bind(new_due_date, todayStr, id).run();

        if (result.meta.changes === 0) {
            return new Response(JSON.stringify({ message: `Update failed: Reminder ID ${id} not found.` }), { 
                status: 404, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
    } catch (e) {
        console.error("DB Error:", e.message);
        return new Response(JSON.stringify({ message: `DB Error: ${e.message}` }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    return new Response(JSON.stringify({ message: `Reminder ${id} updated. Next due date: ${new_due_date}` }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
    });
}
