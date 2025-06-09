import os
import json
import tempfile
from flask import Flask, render_template, request, jsonify, send_file, url_for, redirect
from werkzeug.utils import secure_filename
import xmind
import numpy as np
from PIL import Image
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 限制上传大小为50MB
app.config['SECRET_KEY'] = 'your-secret-key-here'  # 用于session
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 设置静态文件缓存过期时间为0，避免缓存问题
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# 支持的视频格式
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 模拟Qwen2.5 VL模型处理视频内容
def process_video_with_qwen(video_path):
    # 这里只是模拟返回结果，实际应用中需要调用Qwen2.5 VL API
    summary = """
    这个视频介绍了ChatGPT Prompt工程，主要由OpenAI的Isa Fulford和DeepLearning.AI的Andrew Ng讲解。
    
    视频的主要内容包括：
    1. 如何利用大语言模型(LLM)API构建软件应用
    2. Prompt工程的重要性和实践技巧
    3. ChatGPT模型的特性和适用场景
    4. 如何优化提示词以获得更好的结果
    
    讲者强调了良好的prompt设计可以提高LLM的效率和安全性，并且分享了一系列实用技巧。
    """
    
    # 生成思维导图数据
    mindmap_data = {
        "root": {
            "text": "ChatGPT Prompt工程",
            "children": [
                {
                    "text": "基础概念",
                    "children": [
                        {"text": "什么是LLM"},
                        {"text": "API使用方法"},
                        {"text": "Prompt设计原则"}
                    ]
                },
                {
                    "text": "实践技巧",
                    "children": [
                        {"text": "明确指令"},
                        {"text": "提供示例"},
                        {"text": "分割复杂任务"}
                    ]
                },
                {
                    "text": "应用场景",
                    "children": [
                        {"text": "文本生成"},
                        {"text": "内容总结"},
                        {"text": "对话系统"}
                    ]
                }
            ]
        }
    }
    
    return {
        "summary": summary,
        "mindmap": mindmap_data
    }

# 生成XMind思维导图文件
def generate_xmind(mindmap_data):
    workbook = xmind.load("")  # 无需模板，直接创建空白思维导图
    sheet = workbook.getPrimarySheet()
    root_topic = sheet.getRootTopic()
    root_topic.setTitle(mindmap_data["root"]["text"])
    
    for child in mindmap_data["root"]["children"]:
        child_topic = root_topic.addSubTopic()
        child_topic.setTitle(child["text"])
        
        if "children" in child:
            for sub_child in child["children"]:
                sub_topic = child_topic.addSubTopic()
                sub_topic.setTitle(sub_child["text"])
    
    xmind_path = os.path.join(tempfile.gettempdir(), "output.xmind")
    xmind.save(workbook, path=xmind_path)
    return xmind_path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/result')
def result():
    from flask import session
    
    # 检查session中是否有分析结果
    if 'analysis_result' not in session:
        return redirect(url_for('index'))
    
    result_data = session['analysis_result']
    
    # 构建视频URL
    video_url = url_for('serve_video', filename=result_data['video_filename'])
    
    return render_template('result.html',
                         summary=result_data['summary'],
                         mindmap_data=result_data['mindmap'],
                         xmind_path=result_data['xmind_path'],
                         video_url=video_url)

@app.route('/highlights')
def highlights():
    from flask import session
    
    # 检查session中是否有分析结果
    if 'analysis_result' not in session:
        return redirect(url_for('index'))
    
    result_data = session['analysis_result']
    
    # 构建视频URL
    video_url = url_for('serve_video', filename=result_data['video_filename'])
    
    return render_template('highlights.html', video_url=video_url)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'video' not in request.files:
        return jsonify({"error": "没有上传文件"}), 400
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({"error": "未选择文件"}), 400
    
    if file and allowed_file(file.filename):
        # 保存上传的文件
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # 使用示例数据
        from flask import session
        session['analysis_result'] = {
            'summary': "这是一个示例视频分析结果。视频内容包括AI技术介绍、机器学习基础概念、深度学习应用等主要内容。",
            'mindmap': {
                "root": {
                    "text": "视频内容分析",
                    "children": [
                        {
                            "text": "AI技术介绍",
                            "children": [
                                {"text": "机器学习基础"},
                                {"text": "深度学习概念"}
                            ]
                        },
                        {
                            "text": "应用场景",
                            "children": [
                                {"text": "图像识别"},
                                {"text": "自然语言处理"}
                            ]
                        }
                    ]
                }
            },
            'xmind_path': '/tmp/example.xmind',
            'video_filename': filename
        }
        
        return jsonify({
            "status": "success",
            "redirect_url": "/result"
        })
    
    return jsonify({"error": "不支持的文件格式"}), 400

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    question = data.get('question', '')
    
    # 模拟与模型的对话
    if '什么' in question and 'prompt' in question.lower():
        answer = "Prompt工程是设计和优化输入提示以获得更好的AI模型输出的过程。好的prompt能提高模型回答的准确性和相关性。"
    elif '谁' in question:
        answer = "视频中的讲者是OpenAI的Isa Fulford和DeepLearning.AI的Andrew Ng。"
    elif 'llm' in question.lower() or '大语言模型' in question:
        answer = "LLM(大语言模型)是一种基于深度学习的自然语言处理模型，能够理解和生成人类语言。ChatGPT就是一种LLM的应用。"
    else:
        answer = "基于您的问题，我理解您想了解视频中关于" + question + "的内容。视频中提到了Prompt工程的各种技巧和应用场景，建议您关注视频中的具体示例。"
    
    return jsonify({
        "answer": answer
    })

@app.route('/template-data', methods=['GET'])
def template_data():
    """提供模板数据，无需上传视频"""
    # 返回简单的示例数据
    return jsonify({
        "status": "success",
        "summary": "这是一个示例视频分析结果。视频内容包括AI技术介绍、机器学习基础概念等。",
        "mindmap": {
            "root": {
                "text": "示例思维导图",
                "children": [
                    {
                        "text": "主题1",
                        "children": [
                            {"text": "子主题1.1"},
                            {"text": "子主题1.2"}
                        ]
                    },
                    {
                        "text": "主题2",
                        "children": [
                            {"text": "子主题2.1"},
                            {"text": "子主题2.2"}
                        ]
                    }
                ]
            }
        },
        "xmind_path": "/tmp/example.xmind"
    })

@app.route('/download-mindmap', methods=['GET'])
def download_mindmap():
    xmind_path = request.args.get('path')
    if not xmind_path or not os.path.exists(xmind_path):
        return jsonify({"error": "思维导图文件不存在"}), 404
    
    return send_file(xmind_path, as_attachment=True, download_name="video_mindmap.xmind")

@app.route('/video/<filename>')
def serve_video(filename):
    """直接提供视频文件的访问"""
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(video_path):
        return jsonify({"error": "视频文件不存在"}), 404
    
    # 返回视频文件，使用合适的MIME类型
    if filename.lower().endswith('.mp4'):
        mimetype = 'video/mp4'
    elif filename.lower().endswith('.avi'):
        mimetype = 'video/x-msvideo'
    elif filename.lower().endswith('.mov'):
        mimetype = 'video/quicktime'
    else:
        mimetype = 'application/octet-stream'
    
    return send_file(video_path, mimetype=mimetype)

@app.route('/fixed-video')
def serve_fixed_video():
    """提供固定的视频文件"""
    fixed_video = "test2.mp4"
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], fixed_video)
    
    if not os.path.exists(video_path):
        return jsonify({"error": "固定视频文件不存在"}), 404
    
    return send_file(video_path, mimetype='video/mp4')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
