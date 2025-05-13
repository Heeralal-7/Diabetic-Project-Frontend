import Aos from "aos";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const BlogPage = () => {
  useEffect(() => {
    Aos.init();
  }, []);
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
         
            
            `,
        }}
      />
      <div className="container-fluid container-xl">
        <div className="py-3 d-flex align-items-center justify-content-between">
          <h1 className="display-5 my-3 px-3">Blog Tittle</h1>
          <Link
            to="/Blogs"
            className="btn btn-hoverBlue btn-light rounded-circle shadow me-3"
          >
            <i className="ri-arrow-go-back-line fs-5 text-current fw-bold "></i>
          </Link>
        </div>
        <div className="row">
          <div className="col-lg-10 mx-auto bg-white py-3">
            <div
              className="w-100 px-3"
              data-aos="zoom-in-down"
              data-aos-easing="linear"
              data-aos-duration="1200"
            >
              <img
                className="object-fit-cover rounded-3"
                src="	http://holamed.like-themes.com/wp-content/uploads/2018/11/blog_02-1.jpg"
                width="100%"
                height="500px"
                alt=""
              />
            </div>
            <div
              className="d-flex align-items-center flex-wrap gap-3 pb-2 w-100 mt-3  "
              style={{ borderBottom: "2px dashed lightgray" }}
            >
              <span>
                <span className="text-white rounded-pill bg-mainBlue px-3 py-1 fw-semibold  ">
                  Cardiology
                </span>
                <span
                  className="rounded-pill px-2 fw-bold py-1 "
                  style={{ fontSize: "14px", color: "#aeaeb0" }}
                >
                  <i className="fa-solid fa-circle-user   mx-1 text-secondary" />
                  by admin
                </span>
              </span>
              <spam
                className="rounded-pill px-2 fw-bold py-1 "
                style={{ fontSize: "14px", color: "#94949a" }}
              >
                <i className="fa-solid  fa-clock   mx-1 text-secondary" />
                November 7,2024
              </spam>

              <span>
                <i className="fa-solid fa-eye mx-2 text-secondary" />
                878
                <i className="fa-solid fa-comment mx-2 text-secondary" />8
              </span>
            </div>
            <div className="row mt-3">
              <div className="col-md-12">
                <p className="fw-semibold  fs-6 text-secondary fst-italic">
                  Integer maximus accumsan nunc, sit amet tempor lectus
                  facilisis eu. Cras vel elit felis. Vestibulum convallis ipsum
                  id aliquam varius. Etiam nec laoreet turpis. Aenean nisi
                  libero, tempor non sem vitae, hendrerit egestas ex. Nam magna
                  odio, placerat ac risus tristique, viverra tincidunt nibh.
                  Donec vitae leo efficitur, bibendum nibh ac, pretium urna.
                  Vestibulum nunc augue, scelerisque ac vulputate sed, fermentum
                  non nisi.
                </p>
              </div>
            </div>
            <div
              className="mx-auto rounded-2 mt-2  py-3 bg-primary-subtle"
              style={{ width: "90%" }}
            >
              <div className="text-center">
                <blockquote className="quoteIcon py-2">
                  <i className="fa-solid fa-quote-left float-start ms-5"></i>
                  <p className="fw-medium text-justify  fs-6 pt-3 px-3 text-secondary ">
                    Vivamus tristique ligula quis orci malesuada tincidunt.
                    Praesent magna purus, pharetra eu eleifend non, euismod
                    vitae leo. Interdum et malesuada fames ac ante ipsum primis
                    in faucibus. Quisque sapien enim, feugiat et mi vel,
                    fermentum placerat tortor.
                  </p>
                  <i className="fa-solid fa-quote-right float-end me-5"></i>
                </blockquote>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-12">
                <h1 className="pt-2">Medical and Health</h1>
                <p
                  className="fw-semibold  fs-6"
                  style={{ fontSize: "14px", color: "#aeaeb0" }}
                >
                  Integer maximus accumsan nunc, sit amet tempor lectus
                  facilisis eu. Cras vel elit felis. Vestibulum convallis ipsum
                  id aliquam varius. Etiam nec laoreet turpis. Aenean nisi
                  libero, tempor non sem vitae, hendrerit egestas ex. Nam magna
                  odio, placerat ac risus tristique, viverra tincidunt nibh.
                  Donec vitae leo efficitur, bibendum nibh ac, pretium urna.
                  Vestibulum nunc augue, scelerisque ac vulputate sed, fermentum
                  non nisi.
                </p>
                <ul>
                  <li className="text-muted text-medium">
                    Vestibulum iaculis velit
                  </li>
                  <li className="text-muted text-medium">
                    Nec ante varius tempus
                  </li>
                  <li className="text-muted text-medium">
                    Duis sollicitudin lacus sapien
                  </li>
                  <li className="text-muted text-medium">
                    Sed pharetra felis facilisis sed
                  </li>
                </ul>
                <p
                  className="fw-semibold pt-3 fs-6"
                  style={{ fontSize: "14px", color: "#aeaeb0" }}
                >
                  Cras eget sapien auctor, porttitor nisi vitae, vulputate
                  justo. Cras et pharetra ligula, vel <br /> vestibulum ipsum.
                  Orci varius natoque penatibus et magnis dis parturient montes,
                  nascetur <br /> ridiculus mus.
                </p>
              </div>
              <div className="col-md-12">
                <h2 className="pt-2 fw-semibold">
                  5 Things You Didn’t Know About Medical
                </h2>
                <p
                  className="fw-semibold p-0 fs-6"
                  style={{
                    fontSize: "14px",
                    color: "#aeaeb0",
                    textAlign: "justify",
                  }}
                >
                  Quisque scelerisque suscipit purus, nec venenatis nulla
                  lobortis eu. Interdum et malesuada fames ac ante ipsum primis
                  in faucibus. Suspendisse tempor id lacus in tincidunt.
                  Vestibulum porttitor risus diam, nec ullamcorper leo
                  consectetur luctus. Praesent neque nisi, eleifend sed diam
                  sed, ultrices venenatis ipsum. Vestibulum ut sem urna. Mauris
                  lorem neque, egestas eget arcu sit amet, sagittis dictum
                  risus. Sed dolor ligula, dictum ac mattis nec, sagittis non
                  ipsum. Integer sollicitudin nunc vitae nisi facilisis, sed
                  rutrum elit vestibulum. Duis viverra maximus felis at
                  condimentum. Sed congue mi vel massa laoreet, vel laoreet
                  risus sollicitudin. Ut pellentesque est lectus, vitae sodales
                  velit tempus eget. Aenean sem quam, malesuada non venenatis
                  non, porta et magna. Donec nec urna eget sapien ornare
                  tristique. Quisque ac accumsan leo. Curabitur elementum ligula
                  in libero dictum, eu placerat lacus posuere.
                </p>
              </div>
              <div
                className="col-md-12"
                style={{ borderBottom: "2px dashed lightgray" }}
              >
                <img
                  className="object-fit-cover rounded-3"
                  src="http://holamed.like-themes.com/wp-content/uploads/2018/11/blog_03-1-1536x1024.jpg"
                  width="100%"
                  alt=""
                />
                <p
                  className="fw-semibold pt-3 fs-6"
                  style={{ fontSize: "14px", color: "#aeaeb0" }}
                >
                  Nunc placerat dignissim orci, quis auctor ligula ornare non.
                  Morbi nec augue dui. Etiam convallis dui a elit pretium
                  tristique. Phasellus eros tortor, malesuada sed sagittis sit
                  amet, vestibulum in sem. Vivamus elementum et est in mollis.
                  Pellentesque pretium turpis sit amet augue facilisis
                  porttitor. Quisque laoreet neque luctus, gravida eros sit
                  amet, ornare sapien. Phasellus mollis mi id auctor eleifend.
                  Aliquam erat volutpat. Quisque in elit non nisl hendrerit
                  semper. Mauris tristique nisi vitae lacinia tincidunt.
                </p>
                <img
                  className="object-fit-cover rounded-3"
                  src="http://holamed.like-themes.com/wp-content/uploads/2018/11/blog_08-1-1536x1024.jpg"
                  width="100%"
                  alt=""
                />
                <p
                  className="fw-semibold pt-3 fs-6"
                  style={{ fontSize: "14px", color: "#aeaeb0" }}
                >
                  Vestibulum iaculis velit nec ante varius tempus. Duis
                  sollicitudin lacus sapien, sed pharetra felis facilisis sed.
                  Cras hendrerit accumsan vulputate. Ut in suscipit neque. Nunc
                  ultrices pharetra sem sit amet tempor. Cras lorem augue,
                  varius vitae nunc viverra, lacinia commodo erat. Aliquam quis
                  vulputate quam. Curabitur ut mauris eu libero pharetra iaculis
                  finibus sit amet nunc. Nulla at arcu et dolor imperdiet
                  aliquam et vitae arcu. Nam aliquet eros et tempor dapibus.
                  Aliquam nulla metus, dictum at laoreet vel, sagittis sit amet
                  justo. Aliquam mi massa, cursus nec massa et, tincidunt
                  accumsan mi. Phasellus porttitor cursus aliquet.
                </p>
              </div>
              <div className="col-md-12 mt-3">
                <h1>6 Comments</h1>
                <div className="card mb-3 border-0" style={{ width: "95%" }}>
                  <div className="row g-0">
                    <div className="col-md-3 col-4 text-center">
                      <img
                        src="http://0.gravatar.com/avatar/94f3e814e6edf426ebee655956f88869?s=64&d=mm&r=g"
                        className=" rounded-circle mt-4 border border-5"
                        width="60%"
                        alt="..."
                      />
                    </div>
                    <div className="col-md-8 col-8">
                      <div className="card-body">
                        <h5 className="card-title">Sonya Reichert</h5>
                        <p className="card-text">
                          <i className="fa-solid  fa-clock   mx-1 text-secondary" />
                          November 7, 2018 at 1:07 pm
                        </p>
                        <p className="card-text fs-5">
                          <small className="text-muted fw-semibold ">
                            Fugit et eveniet ad omnis enim tempore rerum.
                            Perferendis maiores a culpa sit earum possimus
                            sapiente. Iusto molestiae quisquam sint in
                            aspernatur quod quam.
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 mt-3">
                <div className="card mb-3 border-0" style={{ width: "95%" }}>
                  <div className="row g-0">
                    <div className="col-md-3 col-4 text-center">
                      <img
                        src="http://0.gravatar.com/avatar/94f3e814e6edf426ebee655956f88869?s=64&d=mm&r=g"
                        className=" rounded-circle mt-4 border border-5"
                        width="60%"
                        alt="..."
                      />
                    </div>
                    <div className="col-md-8 col-8">
                      <div className="card-body">
                        <h5 className="card-title">Sonya Reichert</h5>
                        <p className="card-text">
                          <i className="fa-solid  fa-clock   mx-1 text-secondary" />
                          November 7, 2018 at 1:07 pm
                        </p>
                        <p className="card-text fs-5">
                          <small className="text-muted fw-semibold ">
                            Fugit et eveniet ad omnis enim tempore rerum.
                            Perferendis maiores a culpa sit earum possimus
                            sapiente. Iusto molestiae quisquam sint in
                            aspernatur quod quam.
                          </small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
