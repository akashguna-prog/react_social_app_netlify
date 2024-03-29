import Header from './Header';
import Nav from './Nav';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import About from './About';
import Missing from './Missing';
import Footer from './Footer';
import './App.css';
import {Routes,Route,useNavigate} from 'react-router-dom';
import { useState,useEffect } from 'react';
import {format} from 'date-fns';
import api from './apiFile/posts';
import EditPost from './EditPost';
import useWindowSize from './hooks/useWindowSize';
import useAxiosFetch from './hooks/useAxiosFetch';



function App() {
  const[posts,setPosts]=useState([]);
  const[search,setSearch]=useState('');
  const[searchResults,setSearchResults]=useState([]);
  const[postTitle,setPostTitle]=useState('');
  const[postBody,setPostBody]=useState('');
  const[editTitle,setEditTitle]=useState('');
  const[editBody,setEditBody]=useState('');
  const navigate= useNavigate();
  const{width}=useWindowSize();
  const{data,fetchError,isLoading}=useAxiosFetch('http://localhost:3500/posts');

  useEffect(()=>{
    setPosts(data)
  },[data])

  useEffect(()=>{
    const filteredResults=posts.filter((post)=>((post.body).toLowerCase()).includes
    (search.toLowerCase()) || 
    ((post.title).toLowerCase()).includes(search.toLowerCase()));
    setSearchResults(filteredResults.reverse());
  },[posts,search])

  const handleSubmit=async (e)=>{
     e.preventDefault();
     const id = posts.length ? parseInt(posts[posts.length - 1].id) + 1 : 1;
     const dateTime=format(new Date(), 'MMMM dd, yyyy pp');
     const newPost={id,title:postTitle,dateTime,body:postBody};
     try{
     const response=await api.post('/posts',newPost);
     const allPosts=[...posts,response.data];
     setPosts(allPosts)
     setPostTitle('')
     setPostBody('')
     navigate('/')
     } catch (error) {
      if(error.response){
       console.log(error.response.data)
       console.log(error.response.status)
       console.log(error.response.headers)
      }
      else{
       console.log(`Error: ${error.message}`)
      }
   }
  }

  const handleDelete= async (id)=>{
    try{
     await api.delete(`/posts/${id}`)
    const postsList=posts.filter(post=>post.id !==id);
    setPosts(postsList);
    navigate('/')
    }catch(err){
      console.log(`Error: ${err.message}`)
    }
  }

  const handleEdit= async (id)=>{
    const dateTime=format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost={id,title:editTitle,dateTime,body:editBody};
    try {
      const response= await api.put(`/posts/${id}`,updatedPost)
      setPosts(posts.map(post=>post.id===id ? {...response.data}:post))
     setEditTitle('')
     setEditBody('')
     navigate('/')
    } catch (error) {
      
    }
  }

  return (
    <div className="App">
       <Header title="Akash Social media" width={width}/>
       <Nav search={search} setSearch={setSearch}/>
       <Routes>
        <Route path="/" element={<Home posts={searchResults}
        fetchError={fetchError} isLoading={isLoading}/>}/>
       <Route path="post">
       <Route index element={<NewPost 
      handleSubmit={handleSubmit}
      postTitle={postTitle}
      setPostTitle={setPostTitle}
      postBody={postBody}
      setPostBody={setPostBody}
      />}/>
      <Route path=":id" element={<PostPage posts={posts}
       handleDelete={handleDelete}/>}/>
      </Route>
      <Route path="/edit/:id" element={<EditPost posts={posts}
       handleEdit={handleEdit} editBody={editBody} setEditBody={setEditBody}
       editTitle={editTitle} setEditTitle={setEditTitle} />} />
      <Route path="about" element={<About />} />
      <Route path="*" element={<Missing />} /> 
       </Routes>
      <Footer />
    </div>
  );
}

export default App;
