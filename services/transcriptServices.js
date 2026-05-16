const pool = require('../db/index');
const { errorResponse } = require('../utils/response');

const lessonExists = async (lessonId) => {
    const query = 'SELECT 1 FROM lessons WHERE id = $1 LIMIT 1';
    const result = await pool.query(query, [lessonId]);
    return result.rows.length > 0;
};

const createTranscript = async ({ content, end_timestamp, lesson_id, phonetic, sequence, start_timestamp, vietnamese }) => {
    const query = 'INSERT INTO transcripts (content, end_timestamp,lesson_id,phonetic,sequence,start_timestamp,vietnamese) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const values = [content, end_timestamp,lesson_id,phonetic,sequence,start_timestamp,vietnamese];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getTranscriptsById = async (id) => {
    const query = 'SELECT * FROM transcripts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const getTranscriptsByLessonId = async (lessonId) => {
    const query = 'SELECT * FROM transcripts WHERE lesson_id = $1 ORDER BY sequence ASC';
    const result = await pool.query(query, [lessonId]);
    return result.rows;
};

const updateTranscript = async (id, { content, end_timestamp, phonetic, sequence, start_timestamp, vietnamese }) => {
    const query = 'UPDATE transcripts SET content = $1, end_timestamp = $2, phonetic = $3, sequence = $4, start_timestamp = $5, vietnamese = $6 WHERE id = $7 RETURNING *';
    const values = [content, end_timestamp,phonetic,sequence,start_timestamp,vietnamese, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};
const deleteTranscript = async (id) => {
    const query = 'DELETE FROM transcripts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};
const replaceTranscriptsByLesson = async (lessonId, transcriptsArray)=>{
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const deleteQuery = 'DELETE FROM transcripts WHERE lesson_id = $1';
        await client.query(deleteQuery,[lessonId]);
        const insertQuery = `
            INSERT INTO transcripts (lesson_id, sequence, content, phonetic, vietnamese, start_timestamp, end_timestamp) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`;
        
        const insertedTranscripts = [];
        for (const t of transcriptsArray) {
            const values = [
                lessonId, 
                t.sequence, 
                t.content, 
                t.phonetic || '', 
                t.vietnamese || '', 
                t.start_timestamp, 
                t.end_timestamp
            ];
            const res = await client.query(insertQuery, values);
            insertedTranscripts.push(res.rows[0]);
        }
        await client.query('COMMIT');
        return insertedTranscripts;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
};

const bulkCreateTranscripts = async (lessonId, transcriptsArray) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertQuery = `
            INSERT INTO transcripts (lesson_id, sequence, content, phonetic, vietnamese, start_timestamp, end_timestamp) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`;
        const insertedTranscripts = [];
        for (const t of transcriptsArray){
            const values=[
                lessonId, 
                t.sequence, 
                t.content, 
                t.phonetic || '', 
                t.vietnamese || '', 
                t.start_timestamp || 0, 
                t.end_timestamp || 0
            ];
            const res = await client.query(insertQuery,values);
            insertedTranscripts.push(res.rows[0]);
        }
        await client.query('COMMIT');
        return insertedTranscripts;
    } catch (error) {
        await client.query('ROLLBACK')
        throw error;
    }finally{
        client.release();
    }
};

module.exports = {
    lessonExists,
    createTranscript,
    getTranscriptsById,
    getTranscriptsByLessonId,
    updateTranscript,
    deleteTranscript,
    replaceTranscriptsByLesson,
    bulkCreateTranscripts
};
