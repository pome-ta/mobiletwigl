import sys
import pathlib
import ui

sys.path.append(str(pathlib.Path.cwd()) + '/pythonista-webview')
import wkwebview

uri = pathlib.Path('./public/index.html')


class View(ui.View):
  def __init__(self, *args, **kwargs):
    ui.View.__init__(self, *args, **kwargs)
    self.wv = wkwebview.WKWebView()
    self.wv.load_url(str(uri), True)
    self.wv.flex = 'WH'
    self.add_subview(self.wv)

  def will_close(self):
    self.wv.clear_cache()


'''
  def layout(self):
    self.wv.width = self.width
    self.wv.height = self.height
    
  def keyboard_frame_will_change(self, frame):
    
    self.wv.width = self.width
    self.wv.height = frame[1] - self.height
    
    
  def keyboard_frame_did_change(self, frame):
    print('did :', frame)
    self.wv.width = self.width
    self.wv.height = self.height
'''

if __name__ == '__main__':
  view = View()
  view.present(style='fullscreen', orientations=['portrait'])
  #view.present(style='panel', orientations=['portrait'])
  view.wv.clear_cache()

